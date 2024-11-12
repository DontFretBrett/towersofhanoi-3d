export class Timer {
  constructor(element) {
    this.element = element;
    this.startTime = null;
    this.interval = null;
    this.isRunning = false;
    this.elapsedTime = 0;
    this.element.textContent = '00:00';
  }

  start() {
    if (!this.isRunning) {
      this.startTime = Date.now() - this.elapsedTime;
      this.isRunning = true;
      this.interval = setInterval(() => this.update(), 1000);
    }
  }

  stop() {
    if (this.isRunning) {
      clearInterval(this.interval);
      this.isRunning = false;
      this.elapsedTime = Date.now() - this.startTime;
    }
  }

  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.startTime = null;
    this.update();
  }

  update() {
    const currentTime = this.isRunning ? Date.now() - this.startTime : this.elapsedTime;
    const seconds = Math.floor(currentTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    this.element.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeString() {
    const currentTime = this.isRunning ? Date.now() - this.startTime : this.elapsedTime;
    const seconds = Math.floor(currentTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
