import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Project, ClaudeSession, SessionStatus } from '../../shared/types';

const execAsync = promisify(exec);

interface ClaudeProcess {
  pid: number;
  cwd: string;
  cpuUsage: number;
}

export class SessionService {
  private claudeProjectsPath = path.join(os.homedir(), '.claude', 'projects');

  // Cache for file modification times to avoid re-parsing unchanged files
  private fileModificationCache: Map<string, Date> = new Map();

  private parsedSessionCache: Map<string, ClaudeSession> = new Map();

  public async getRecentProjects(agentName: string): Promise<Project[]> {
    if (agentName === 'Claude Code') {
      return this.getClaudeProjects();
    }
    return [];
  }

  // New method for feature parity: Get active sessions with detailed status
  public async getActiveSessions(): Promise<ClaudeSession[]> {
    try {
      // 1. Find active Claude processes
      const processes = await this.findClaudeProcesses();
      console.log(`[SessionService] Found ${processes.length} Claude processes:`, processes);

      // 2. Map CWD to processes
      const cwdToProcesses: Record<string, ClaudeProcess[]> = {};
      for (const proc of processes) {
        if (proc.cwd) {
          if (!cwdToProcesses[proc.cwd]) {
            cwdToProcesses[proc.cwd] = [];
          }
          cwdToProcesses[proc.cwd].push(proc);
        }
      }

      const foundSessions: ClaudeSession[] = [];

      // 3. Scan ~/.claude/projects directory
      if (!fs.existsSync(this.claudeProjectsPath)) {
        return [];
      }

      const entries = await fs.promises.readdir(this.claudeProjectsPath, { withFileTypes: true });

      /* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue */
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const dirName = entry.name;
        // Convert dir name to potential path (matching Swift logic)
        // Swift: convertDirNameToPath
        let projectPath = this.convertDirNameToPath(dirName);

        // Find active processes for this project
        // Try direct match first
        let activeProcesses = cwdToProcesses[projectPath];

        // If no direct match, try to match by encoding checks (Robust Fallback)
        if (!activeProcesses) {
          const cleanDirName = dirName.startsWith('-') ? dirName.substring(1) : dirName;
          console.log(`[SessionService] Trying to match dirName: ${dirName}, cleanDirName: ${cleanDirName}`);

          // eslint-disable-next-line no-restricted-syntax
          for (const [cwd, procs] of Object.entries(cwdToProcesses)) {
            // Encode the real CWD to see if it matches the folder name
            const encodedCwd = this.encodePathToDirName(cwd);
            console.log(`[SessionService] CWD: ${cwd}, encodedCwd: ${encodedCwd}`);
            if (encodedCwd === cleanDirName) {
              console.log(`[SessionService] MATCH FOUND!`);
              activeProcesses = procs;
              // eslint-disable-next-line no-param-reassign
              projectPath = cwd; // Use the real CWD from process
              break;
            }
          }
        }

        // Default to empty if still not found
        if (!activeProcesses) activeProcesses = [];

        // Get JSONL files
        const jsonlFiles = await this.getRecentJsonlFiles(path.join(this.claudeProjectsPath, dirName));

        // Match processes to sessions (Greedy match: 1 process -> 1 session)
        const usedFileIndices = new Set<number>();

        // Scenario 1: We have active processes for this project
        if (activeProcesses.length > 0) {
          for (const proc of activeProcesses) {
            // Find first unused valid session file
            for (let i = 0; i < jsonlFiles.length; i++) {
              if (usedFileIndices.has(i)) continue;

              const file = jsonlFiles[i];
              // Pass the process's PID/Usage to the parser
              const session = await this.parseSessionFile(file, dirName, proc);

              if (session) {
                foundSessions.push(session);
                usedFileIndices.add(i);
                break; // Found a session for this process
              }
            }
          }
        }
        // Scenario 2: No active process, but maybe file is recently updated (Swift logic implies it primarily scans active processes for list)
        // However, we might want to show "recent" sessions too?
        // The Swift code `scan()` iterates `entries` (projects) but then `guard let activeProcesses ... else { continue }`
        // This means it ONLY shows sessions that have an active process running.

        // Let's replicate strict behavior first: ONLY active processes.
        // Wait, the user complaint was "empty session although I'm running".
        // My previous logic was "if (session.pid > 0 || status === 'processing')".
        // If I strict match process -> session, and I find the process, I will have PID > 0.

        // IMPORTANT: What if there are remaining recent files but no process? Swift skips them.
        // "guard let activeProcesses = activeProcesses, !activeProcesses.isEmpty else { continue }"

        // I will follow this logic for "Active Sessions".
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop, no-continue */

      return foundSessions.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

    } catch (error) {
      console.error('SessionService: Error active sessions:', error);
      return [];
    }
  }

  // Swift Port: convertDirNameToPath
  private convertDirNameToPath(dirName: string): string {
    // Logic:
    // If starts with "-", drop it.
    // Replace "-" with "/"
    // Prepend "/"
    // e.g. "-Users-thinh-Project" -> "Users-thinh-Project" -> "Users/thinh/Project" -> "/Users/thinh/Project"

    let name = dirName;
    if (name.startsWith('-')) {
      name = name.substring(1);
    }
    // Replace ALL occurrences of "-" with "/"
    // Note: This logic assumes path components don't contain dashes, or the encoding is specific.
    // Claude's encoding is likely slightly more complex (e.g. double encoding dashes), but let's trust the Swift reference for now.
    // Swift: name.replacingOccurrences(of: "-", with: "/")
    return `/${name.split('-').join('/')}`;
  }

  // Swift Port: encodePathToDirName
  private encodePathToDirName(pathStr: string): string {
    let p = pathStr;
    if (p.startsWith('/')) {
      p = p.substring(1);
    }
    return p.split('/').join('-');
  }

  private async getClaudeProjects(): Promise<Project[]> {
    try {
      if (!fs.existsSync(this.claudeProjectsPath)) {
        return [];
      }

      const entries = await fs.promises.readdir(this.claudeProjectsPath, { withFileTypes: true });

      const projects = await Promise.all(entries.map(async (entry): Promise<Project | null> => {
        if (entry.isDirectory()) {
          const projectPathConfig = path.join(this.claudeProjectsPath, entry.name);
          const stats = await fs.promises.stat(projectPathConfig);
          // Decoded real path
          const realPath = this.convertDirNameToPath(entry.name);

          return {
            id: entry.name,
            name: path.basename(realPath), // Better name from path
            path: realPath,
            lastActivityDate: stats.mtime,
            agentName: 'Claude Code'
          };
        }
        return null;
      }));

      const validProjects = projects.filter((p): p is Project => p !== null);
      return validProjects.sort((a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime());

    } catch (error) {
      console.error('Error fetching Claude projects:', error);
      return [];
    }
  }

  // --- Helper Methods ---

  private async findClaudeProcesses(): Promise<ClaudeProcess[]> {
    try {
      // macOS specific command
      const { stdout } = await execAsync('ps -ax -o pid,pcpu,command');
      const lines = stdout.split('\n').slice(1); // Skip header
      const processes: ClaudeProcess[] = [];

      /* eslint-disable no-restricted-syntax, no-await-in-loop, no-continue */
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 3) continue;

        const pid = parseInt(parts[0], 10);
        const cpu = parseFloat(parts[1]);
        const command = parts.slice(2).join(' ');

        if (command.includes('claude') && !command.includes('electron') && !command.includes('agent-management')) {
          console.log(`[SessionService] Found Claude process PID ${pid}, command: ${command}`);
          // Get CWD
          const cwd = await this.getCWDForProcess(pid);
          console.log(`[SessionService] PID ${pid} CWD: ${cwd}`);
          if (cwd) {
            processes.push({ pid, cwd, cpuUsage: cpu });
          }
        }
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop, no-continue */
      return processes;
    } catch (e) {
      console.error('Error finding processes:', e);
      return [];
    }
  }

  private async getCWDForProcess(pid: number): Promise<string | null> {
    try {
      // Swift: lsof -a -p PID -d cwd -F n
      // The -a flag is critical - it ANDs the conditions together
      const { stdout } = await execAsync(`lsof -a -p ${pid} -d cwd -F n`);
      // Output: p<pid>\nn<cwd>
      const lines = stdout.split('\n');
      /* eslint-disable no-restricted-syntax */
      for (const line of lines) {
        if (line.startsWith('n') && line !== 'n/') {
          return line.substring(1);
        }
      }

      /* eslint-enable no-restricted-syntax */
    } catch (e) {
      // Ignore errors
    }
    return null;
  }

  private async getRecentJsonlFiles(dirPath: string): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(dirPath);
      const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));

      const filesWithStats = await Promise.all(jsonlFiles.map(async f => {
        const fullPath = path.join(dirPath, f);
        const stats = await fs.promises.stat(fullPath);
        return { path: fullPath, mtime: stats.mtime };
      }));

      return filesWithStats
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .map(f => f.path);
    } catch {
      return [];
    }
  }

  private async parseSessionFile(filePath: string, dirName: string, process: ClaudeProcess): Promise<ClaudeSession | null> {
    try {
      const stats = await fs.promises.stat(filePath);
      const modificationDate = stats.mtime;

      // Check cache
      if (this.fileModificationCache.get(filePath)?.getTime() === modificationDate.getTime()) {
        const cached = this.parsedSessionCache.get(filePath);
        if (cached) {
          // Update dynamic fields from process
          cached.pid = process.pid;
          cached.cpuUsage = process.cpuUsage;
          // High CPU override
          if (cached.status === 'waiting' && process.cpuUsage > 5.0) {
            cached.status = 'processing';
          }
          return cached;
        }
      }

      // Read last 50KB
      const bufferSize = 50 * 1024;
      const fileSize = stats.size;
      const start = Math.max(0, fileSize - bufferSize);

      const handle = await fs.promises.open(filePath, 'r');
      const buffer = Buffer.alloc(Math.min(bufferSize, fileSize));
      await handle.read(buffer, 0, buffer.length, start);
      await handle.close();

      const content = buffer.toString('utf-8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);

      let sessionId: string | undefined;
      let lastMessage: string | undefined;
      let lastRole: string | undefined;
      let status: SessionStatus = 'idle';

      let lastMsgType: string | undefined;

      // Parse lines (simplified logic from Swift)
      // eslint-disable-next-line no-restricted-syntax
      for (const line of lines) {
        try {
          const msg = JSON.parse(line);
          if (msg.sessionId && !sessionId) sessionId = msg.sessionId;

          if (msg.type) lastMsgType = msg.type;

          if (msg.message && msg.message.content) {
            lastRole = msg.message.role;

            const contentVal = msg.message.content;
            if (typeof contentVal === 'string') {
              lastMessage = contentVal;
            } else if (Array.isArray(contentVal)) {
              // Check for tool use
              if (contentVal.some((b: any) => b.type === 'tool_use')) {
                status = 'thinking';
              }
              // Extract text
              const textBlock = contentVal.find((b: any) => b.type === 'text');
              if (textBlock) lastMessage = textBlock.text;
            }
          }
        } catch {
          // Ignore parse error
        }
      }

      if (!sessionId) return null;

      // Determine status based on last message
      const secondsSinceModified = (Date.now() - modificationDate.getTime()) / 1000;
      const recentlyModified = secondsSinceModified < 3.0;

      if (lastMsgType === 'user' && !recentlyModified) {
        status = 'waiting';
      } else if (recentlyModified) {
        status = 'processing';
      }

      const realProjectPath = this.convertDirNameToPath(dirName);

      const session: ClaudeSession = {
        id: sessionId,
        projectName: path.basename(realProjectPath),
        projectPath: realProjectPath,
        filePath,
        status,
        lastMessage: lastMessage?.substring(0, 150) + (lastMessage && lastMessage.length > 150 ? '...' : ''),
        lastMessageRole: lastRole,
        lastActivityAt: modificationDate,
        pid: process.pid,
        cpuUsage: process.cpuUsage
      };

      // Helper logic from Swift: Override status if high CPU
      if (session.status === 'waiting' && session.cpuUsage > 5.0) {
        session.status = 'processing';
      }

      // Update cache
      this.fileModificationCache.set(filePath, modificationDate);
      this.parsedSessionCache.set(filePath, session);

      return session;

    } catch (e) {
      console.error(`Error parsing session ${filePath}:`, e);
      return null;
    }
  }
}
