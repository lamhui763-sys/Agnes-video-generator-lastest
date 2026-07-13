/**
 * Video Generation Request Queue System
 * 
 * Controls concurrent video generation requests to avoid API rate limits (429 errors).
 * Requests are processed sequentially with intelligent backoff on rate limit errors.
 */

export interface VideoQueueTask {
  id: string;
  prompt: string;
  outputPath: string;
  apikey?: string;  // Add API key support
  resolve: (value: { success: boolean; outputPath?: string; error?: string }) => void;
  startTime?: number;
}

class VideoGenerationQueue {
  private queue: VideoQueueTask[] = [];
  private isProcessing = false;
  private maxConcurrent = 1; // Process one video at a time to avoid rate limits
  private currentRunning = 0;

  /**
   * Add a video generation task to the queue
   */
  enqueue(task: Omit<VideoQueueTask, 'resolve' | 'startTime'>): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    return new Promise((resolve) => {
      const queueTask: VideoQueueTask = {
        ...task,
        resolve,
        startTime: Date.now(),
      };

      this.queue.push(queueTask);
      console.log(`[VideoQueue] Task ${task.id} added to queue. Queue length: ${this.queue.length}`);
      console.log(`[VideoQueue] Current concurrent tasks: ${this.currentRunning}/${this.maxConcurrent}`);

      // Start processing if not already running
      this.processQueue();
    });
  }

  /**
   * Process the queue sequentially
   */
  private async processQueue(): Promise<void> {
    // If already processing or at max concurrency, wait
    if (this.isProcessing || this.currentRunning >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.currentRunning < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) break;

      this.currentRunning++;
      console.log(`[VideoQueue] Processing task ${task.id}. Concurrent: ${this.currentRunning}/${this.maxConcurrent}`);

      // Process task in parallel (but limited by maxConcurrent)
      this.processTask(task).catch((err) => {
        console.error(`[VideoQueue] Task ${task.id} failed unexpectedly:`, err);
      });
    }

    this.isProcessing = false;
  }

  /**
   * Process a single video generation task with retry logic for 429 errors
   */
  private async processTask(task: VideoQueueTask): Promise<void> {
    try {
      // Simulate calling the actual video generation function
      // In reality, this would spawn the Python process or call the API
      const result = await this.generateVideo(task);
      task.resolve(result);
    } catch (error: any) {
      task.resolve({ success: false, error: error.message || 'Unknown error' });
    } finally {
      this.currentRunning--;
      console.log(`[VideoQueue] Task ${task.id} completed. Concurrent: ${this.currentRunning}/${this.maxConcurrent}`);
      
      // Continue processing queue
      this.processQueue();
    }
  }

  /**
   * Generate video with built-in retry logic for rate limits
   */
  private async generateVideo(task: VideoQueueTask): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`[VideoQueue] Attempting video generation for task ${task.id} (attempt ${attempt + 1}/${maxRetries})`);

        // Spawn the Python process to generate video
        const { spawn } = await import('child_process');
        const path = await import('path');

        await new Promise<void>((resolve, reject) => {
          const args = [
            'src/agnes_video.py',
            '--prompt', task.prompt,
            '--output', task.outputPath,
            '--poll-interval', '5',
          ];

          console.log(`[VideoQueue] Spawning Python process with command: python3 ${args.join(' ')}`);
          console.log(`[VideoQueue] API key length: ${task.apikey ? task.apikey.length : 0} chars, starts with: ${task.apikey ? task.apikey.substring(0, 8) + '...' : 'NONE'}`);
          
          const child = spawn('python3', args, {
            env: { 
              ...process.env, 
              AGNES_API_KEY: task.apikey || process.env.AGNES_API_KEY || '' 
            },
            stdio: ['inherit', 'pipe', 'pipe']
          });

          let stderrOutput = '';

          child.stdout.on('data', (data: Buffer) => {
            const line = data.toString();
            console.log(`[VideoQueue][${task.id}] STDOUT: ${line.trim()}`);
          });

          child.stderr.on('data', (data: Buffer) => {
            const line = data.toString();
            stderrOutput += line;
            console.log(`[VideoQueue][${task.id}] STDERR: ${line.trim()}`);
            
            // Check for 429 rate limit error
            if (line.includes('429') || line.includes('rate_limit_exceeded') || line.includes('rate limit exceeded')) {
              console.log(`[VideoQueue] Rate limit detected for task ${task.id}`);
              reject(new Error('RATE_LIMITED'));
              child.kill();
              return;
            }
          });

          child.on('error', (err) => {
            console.error(`[VideoQueue] Failed to start Python process for task ${task.id}:`, err);
            reject(new Error(`Failed to start Python process: ${err.message}. Make sure python3 is installed and in PATH.`));
          });

          child.on('close', (code) => {
            console.log(`[VideoQueue] Python process exited with code ${code} for task ${task.id}`);
            if (code === 0) {
              resolve();
            } else {
              const errorMsg = stderrOutput || `Exit code: ${code}`;
              reject(new Error(`Video generation failed (code ${code}): ${errorMsg}`));
            }
          });
        });

        // Success - return output path
        // Note: Cloud upload should be handled by the caller (server.ts)
        // to avoid circular dependencies and ensure proper error handling
        return { success: true, outputPath: task.outputPath };

      } catch (error: any) {
        attempt++;

        // If it's a rate limit error and we have retries left, wait and retry
        if (error.message === 'RATE_LIMITED' && attempt < maxRetries) {
          // Exponential backoff: 10s, 20s, 40s, 80s, 160s
          const backoffTime = Math.min(10 * Math.pow(2, attempt - 1), 120);
          console.log(`[VideoQueue] Rate limit hit for task ${task.id}. Waiting ${backoffTime}s before retry (attempt ${attempt}/${maxRetries})...`);
          
          await this.sleep(backoffTime * 1000);
          continue;
        }

        // Non-rate-limit error or max retries reached
        throw error;
      }
    }

    return { success: false, error: 'Max retries exceeded due to rate limiting' };
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current queue status
   */
  getStatus(): { queued: number; running: number; maxConcurrent: number } {
    return {
      queued: this.queue.length,
      running: this.currentRunning,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Clear the queue (remove pending tasks)
   */
  clearQueue(): number {
    const cleared = this.queue.length;
    this.queue = [];
    console.log(`[VideoQueue] Cleared ${cleared} pending tasks from queue`);
    return cleared;
  }

  /**
   * Set maximum concurrent tasks (usually 1 for rate limit avoidance)
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max);
    console.log(`[VideoQueue] Max concurrent tasks set to: ${this.maxConcurrent}`);
  }
}

// Export singleton instance
export const videoQueue = new VideoGenerationQueue();
export default videoQueue;
