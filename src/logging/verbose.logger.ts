export const VerboseLogging = new class {

    private name: string

    debug(...text) {
        console.log(this.formatText(LogLevel.DEBUG, ...text))

    }

    info(...text) {
        console.info(this.formatText(LogLevel.INFO, ...text))
    }

    error(...text) {
        console.error(this.formatText(LogLevel.ERROR, ...text))
    }

    formatText(level: LogLevel, ...text: any): string {
        return `${new Date().getTime()} - ${level}    ${this.name}   ${text.join(' ')}`
    }

    configure(opt: { name: string }) {
        this.name = opt.name
    }
}()


enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    ERROR = 'ERROR'
}