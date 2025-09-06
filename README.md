# Warframe Event Notifier Bot

A lightweight and efficient Discord bot designed to monitor and announce in-game events for Warframe. It periodically fetches data from the `warframestat.us` API and notifies a designated channel of new alerts, invasions, and other time-sensitive activities, ensuring you and your squad never miss an opportunity.

## Features

* **Automated Event Notifications**: The bot runs a polling service in the background to check for new Warframe events (such as Alerts, Invasions, and Fissures) and announces them in a specificed Discord channel.
* **On-demand Commands**: A command handler is in place to support slash commands for checking the current game state, such as Cetus time or active Sortie missions.

## Technology Stack

* **Runtime**: Node.js
* **Discord API Library**: `discord.js`
* **Database**: `better-sqlite3` for persistent, transactional state management.
* **HTTP Client**: `axios` for interacting with the Warframe API.
* **Configuration**: `dotenv` for secure management of environment variables.
* **Process Management**: Recommended deployment via `pm2` for robust, continuous operation.

## Setup and Installation

Follow these steps to get a local instance of the bot running.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chematus/baro-kefir-bot.git
    cd baro-kefir-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, edit the `.env` file with your specific credentials.

## Configuration

The `.env` file contains all necessary configuration for the bot.

## Usage
Once the dependencies are installed and the configuration is set, you can run the bot.

**For development:**

```bash
node index.js
```

**For production deployment (recommended):**
Using `pm2` will ensure the bot restarts automatically if it crashes or the host system reboots.

```bash
# Install pm2 globally
npm install pm2 -g

# Start the bot with pm2
pm2 start index.js --name "kefir"

# To monitor logs
pm2 logs kefir

# To stop the bot
pm2 stop kefir
```
