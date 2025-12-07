# project/main.py

from config import Config

if __name__ == '__main__':
    Config.init_dirs()
    init_db()
    logger.info('Starting hot folder watcher...')
    from watcher import start_watcher_initial
    start_watcher_initial()  # uses current config