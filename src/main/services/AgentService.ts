import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { Agent } from '../../shared/types';

const execAsync = promisify(exec);

export class AgentService {
  private agents: Agent[] = [
    {
      id: randomUUID(),
      name: 'Claude Code',
      iconName: 'claude',
      isRunning: false,
      isInstalled: true,
      isMonitoring: true,
    },
    {
      id: randomUUID(),
      name: 'Cursor',
      iconName: 'cursor',
      isRunning: false,
      isInstalled: true,
      isMonitoring: true,
    },
    {
      id: randomUUID(),
      name: 'Antigravity',
      iconName: 'antigravity',
      isRunning: false,
      isInstalled: true,
      isMonitoring: true,
    },
    {
      id: randomUUID(),
      name: 'GitHub Copilot',
      iconName: 'github',
      isRunning: false,
      isInstalled: true,
      isMonitoring: true,
    },
  ];

  constructor() {
    this.startMonitoring();
  }

  private async checkProcess(processName: string): Promise<boolean> {
    try {
      // Basic check using pgrep
      // Adjust process names as needed for MacOS
      const nameToCheck = processName === 'Claude Code' ? 'claude'
        : processName === 'Cursor' ? 'Cursor'
          : processName;

      await execAsync(`pgrep -f "${nameToCheck}"`);
      return true;
    } catch {
      return false;
    }
  }

  public async updateAgentStatuses(): Promise<Agent[]> {
    const updatedAgents = await Promise.all(
      this.agents.map(async (agent) => {
        const isRunning = await this.checkProcess(agent.name);
        return { ...agent, isRunning };
      })
    );
    this.agents = updatedAgents;
    return this.agents;
  }

  public getAgents(): Agent[] {
    return this.agents;
  }

  private startMonitoring() {
    setInterval(async () => {
      await this.updateAgentStatuses();
      // TODO: Emit event to renderer if needed here,
      // or let renderer poll/subscribe.
    }, 5000);
  }
}
