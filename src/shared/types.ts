export interface UsageData {
  current: number;
  limit: number;
  percentage: number;
  formattedCurrent: string;
  formattedLimit: string;
}

export type SessionStatus = 'waiting' | 'processing' | 'thinking' | 'idle';

export interface ClaudeSession {
  id: string;
  projectName: string;
  projectPath: string;
  filePath?: string;
  gitBranch?: string;
  status: SessionStatus;
  lastMessage?: string;
  lastMessageRole?: string;
  lastActivityAt: Date;
  pid: number;
  cpuUsage: number;
  createdAt?: Date;
}

export interface Agent {
  id: string; // UUID
  name: string;
  iconName: string; // System image name or file path
  isRunning: boolean;
  isInstalled: boolean;
  isMonitoring: boolean;

  // New fields for feature parity
  contextUsage?: string; // e.g. "5000 / 20000"
  accountInfo?: string; // e.g. "user@example.com"
  plan?: string; // e.g. "Pro"
}

export interface Project {
  id: string; // UUID
  name: string;
  path: string;
  lastActivityDate: Date;
  agentName?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Session { // Legacy/Generic session
  id: string;
  projectPath: string;
  agentName: string;
  startTime: Date;
  lastMessageTime: Date;
  messages: Message[];
}
