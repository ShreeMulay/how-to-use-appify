#!/usr/bin/env bun
/**
 * Apify Learning Lab CLI
 * ======================
 * Command-line interface for interacting with Apify API.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { getClient } from "./lib/client";

// Popular actors for quick reference
const POPULAR_ACTORS = [
  {
    id: "apify/website-content-crawler",
    name: "Website Content Crawler",
    category: "AI/LLM",
  },
  {
    id: "apify/rag-web-browser",
    name: "RAG Web Browser",
    category: "AI/LLM",
  },
  {
    id: "apify/instagram-scraper",
    name: "Instagram Scraper",
    category: "Social",
  },
  {
    id: "clockworks/free-tiktok-scraper",
    name: "TikTok Scraper",
    category: "Social",
  },
  {
    id: "apify/google-maps-scraper",
    name: "Google Maps Scraper",
    category: "Business",
  },
  {
    id: "apify/web-scraper",
    name: "Web Scraper",
    category: "Developer",
  },
];

const program = new Command();

program
  .name("apify-lab")
  .description("CLI for Apify Learning Lab")
  .version("1.0.0");

// ===========================================================================
// Actors Commands
// ===========================================================================

const actors = program.command("actors").description("Manage actors");

actors
  .command("list")
  .description("List popular actors")
  .option("-c, --category <category>", "Filter by category")
  .action((options) => {
    console.log(chalk.bold.blue("\n📦 Popular Actors\n"));

    let filtered = POPULAR_ACTORS;
    if (options.category) {
      filtered = POPULAR_ACTORS.filter((a) =>
        a.category.toLowerCase().includes(options.category.toLowerCase())
      );
    }

    console.log(
      chalk.dim("ID".padEnd(35)) +
        chalk.dim("Name".padEnd(30)) +
        chalk.dim("Category")
    );
    console.log(chalk.dim("─".repeat(75)));

    for (const actor of filtered) {
      console.log(
        chalk.cyan(actor.id.padEnd(35)) +
          chalk.white(actor.name.padEnd(30)) +
          chalk.yellow(actor.category)
      );
    }

    console.log(
      chalk.dim(`\nTotal: ${filtered.length} actors`)
    );
    console.log(
      chalk.dim("Run: apify-lab actors info <id> for details\n")
    );
  });

actors
  .command("info <actorId>")
  .description("Get actor details")
  .action(async (actorId) => {
    const spinner = ora("Fetching actor info...").start();

    try {
      const client = getClient();
      const { data } = await client.getActor(actorId);

      spinner.succeed("Actor info fetched");

      console.log(chalk.bold.blue(`\n📦 ${data.title || data.name}\n`));
      console.log(chalk.dim("ID:       ") + chalk.cyan(data.id));
      console.log(chalk.dim("Username: ") + chalk.cyan(data.username));
      console.log(chalk.dim("Name:     ") + chalk.white(data.name));
      console.log(chalk.dim("Public:   ") + (data.isPublic ? "Yes" : "No"));

      if (data.stats) {
        console.log(chalk.dim("\nStats:"));
        console.log(chalk.dim("  Runs:  ") + data.stats.totalRuns);
        console.log(chalk.dim("  Users: ") + data.stats.totalUsers);
      }

      console.log(
        chalk.dim("\nView on Apify: ") +
          chalk.underline(`https://apify.com/${actorId}`)
      );
      console.log();
    } catch (error) {
      spinner.fail("Failed to fetch actor info");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

actors
  .command("run <actorId>")
  .description("Run an actor")
  .option("-i, --input <json>", "Input JSON")
  .option("-w, --wait", "Wait for completion")
  .action(async (actorId, options) => {
    const spinner = ora("Starting actor run...").start();

    try {
      const client = getClient();
      const input = options.input ? JSON.parse(options.input) : {};

      const { data: run } = await client.runActor(actorId, input);

      spinner.succeed(`Actor run started: ${run.id}`);

      console.log(chalk.bold.blue("\n🚀 Run Details\n"));
      console.log(chalk.dim("Run ID:    ") + chalk.cyan(run.id));
      console.log(chalk.dim("Status:    ") + chalk.yellow(run.status));
      console.log(chalk.dim("Dataset:   ") + chalk.cyan(run.defaultDatasetId));

      if (options.wait) {
        spinner.start("Waiting for completion...");

        let status = run.status;
        while (status === "RUNNING" || status === "READY") {
          await new Promise((r) => setTimeout(r, 5000));
          const { data: updated } = await client.getRun(run.id);
          status = updated.status;
          spinner.text = `Status: ${status}`;
        }

        if (status === "SUCCEEDED") {
          spinner.succeed(`Run completed: ${status}`);
        } else {
          spinner.fail(`Run ended: ${status}`);
        }
      }

      console.log(
        chalk.dim("\nView in console: ") +
          chalk.underline(
            `https://console.apify.com/actors/${actorId}/runs/${run.id}`
          )
      );
      console.log();
    } catch (error) {
      spinner.fail("Failed to run actor");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

// ===========================================================================
// Datasets Commands
// ===========================================================================

const datasets = program.command("datasets").description("Manage datasets");

datasets
  .command("list")
  .description("List datasets")
  .option("-l, --limit <n>", "Number of datasets", "10")
  .action(async (options) => {
    const spinner = ora("Fetching datasets...").start();

    try {
      const client = getClient();
      const { data } = await client.listDatasets(parseInt(options.limit));

      spinner.succeed(`Found ${data.items.length} datasets`);

      console.log(chalk.bold.blue("\n📊 Datasets\n"));

      if (data.items.length === 0) {
        console.log(chalk.dim("No datasets found."));
      } else {
        console.log(
          chalk.dim("ID".padEnd(25)) +
            chalk.dim("Name".padEnd(25)) +
            chalk.dim("Items".padEnd(10)) +
            chalk.dim("Created")
        );
        console.log(chalk.dim("─".repeat(75)));

        for (const ds of data.items) {
          const created = new Date(ds.createdAt).toLocaleDateString();
          console.log(
            chalk.cyan(ds.id.slice(0, 22).padEnd(25)) +
              chalk.white((ds.name || "unnamed").slice(0, 22).padEnd(25)) +
              chalk.yellow(String(ds.itemCount).padEnd(10)) +
              chalk.dim(created)
          );
        }
      }
      console.log();
    } catch (error) {
      spinner.fail("Failed to list datasets");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

datasets
  .command("show <datasetId>")
  .description("Show dataset items")
  .option("-l, --limit <n>", "Number of items", "10")
  .action(async (datasetId, options) => {
    const spinner = ora("Fetching dataset items...").start();

    try {
      const client = getClient();
      const items = await client.getDatasetItems(
        datasetId,
        parseInt(options.limit)
      );

      spinner.succeed(`Found ${items.length} items`);

      console.log(chalk.bold.blue("\n📊 Dataset Items\n"));

      for (let i = 0; i < items.length; i++) {
        console.log(chalk.cyan(`--- Item ${i + 1} ---`));
        console.log(JSON.stringify(items[i], null, 2).slice(0, 500));
        if (JSON.stringify(items[i]).length > 500) {
          console.log(chalk.dim("... (truncated)"));
        }
        console.log();
      }
    } catch (error) {
      spinner.fail("Failed to fetch dataset items");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

datasets
  .command("export <datasetId>")
  .description("Export dataset to file")
  .option("-o, --output <file>", "Output file", "dataset.json")
  .action(async (datasetId, options) => {
    const spinner = ora("Exporting dataset...").start();

    try {
      const client = getClient();
      const items = await client.getDatasetItems(datasetId, 10000);

      await Bun.write(options.output, JSON.stringify(items, null, 2));

      spinner.succeed(`Exported ${items.length} items to ${options.output}`);
    } catch (error) {
      spinner.fail("Failed to export dataset");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

// ===========================================================================
// Runs Commands
// ===========================================================================

const runs = program.command("runs").description("Manage runs");

runs
  .command("list")
  .description("List recent runs")
  .option("-l, --limit <n>", "Number of runs", "10")
  .option("-s, --status <status>", "Filter by status")
  .action(async (options) => {
    const spinner = ora("Fetching runs...").start();

    try {
      const client = getClient();
      const { data } = await client.listRuns({
        limit: parseInt(options.limit),
        status: options.status,
      });

      spinner.succeed(`Found ${data.items.length} runs`);

      console.log(chalk.bold.blue("\n🏃 Recent Runs\n"));

      console.log(
        chalk.dim("ID".padEnd(20)) +
          chalk.dim("Actor".padEnd(25)) +
          chalk.dim("Status".padEnd(12)) +
          chalk.dim("Started")
      );
      console.log(chalk.dim("─".repeat(75)));

      for (const run of data.items) {
        const started = new Date(run.startedAt).toLocaleString();
        const statusColor =
          run.status === "SUCCEEDED"
            ? chalk.green
            : run.status === "FAILED"
            ? chalk.red
            : run.status === "RUNNING"
            ? chalk.yellow
            : chalk.dim;

        console.log(
          chalk.cyan(run.id.slice(0, 17).padEnd(20)) +
            chalk.white((run.actId || "").slice(0, 22).padEnd(25)) +
            statusColor(run.status.padEnd(12)) +
            chalk.dim(started)
        );
      }
      console.log();
    } catch (error) {
      spinner.fail("Failed to list runs");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

runs
  .command("logs <runId>")
  .description("Show run logs")
  .action(async (runId) => {
    const spinner = ora("Fetching logs...").start();

    try {
      const client = getClient();
      const log = await client.getRunLog(runId);

      spinner.succeed("Logs fetched");
      console.log(chalk.bold.blue("\n📋 Run Logs\n"));
      console.log(log);
    } catch (error) {
      spinner.fail("Failed to fetch logs");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

runs
  .command("abort <runId>")
  .description("Abort a running actor")
  .action(async (runId) => {
    const spinner = ora("Aborting run...").start();

    try {
      const client = getClient();
      await client.abortRun(runId);

      spinner.succeed("Run aborted");
    } catch (error) {
      spinner.fail("Failed to abort run");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

// ===========================================================================
// Storage Commands
// ===========================================================================

const storage = program.command("storage").description("Manage key-value stores");

storage
  .command("list")
  .description("List key-value stores")
  .action(async () => {
    const spinner = ora("Fetching stores...").start();

    try {
      const client = getClient();
      const { data } = await client.listKeyValueStores();

      spinner.succeed(`Found ${data.items.length} stores`);

      console.log(chalk.bold.blue("\n🗄️ Key-Value Stores\n"));

      for (const store of data.items) {
        console.log(
          chalk.cyan(store.id) +
            " - " +
            chalk.white(store.name || "unnamed")
        );
      }
      console.log();
    } catch (error) {
      spinner.fail("Failed to list stores");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

storage
  .command("get <storeId> <key>")
  .description("Get a record from a store")
  .action(async (storeId, key) => {
    const spinner = ora("Fetching record...").start();

    try {
      const client = getClient();
      const value = await client.getKeyValueRecord(storeId, key);

      spinner.succeed("Record fetched");
      console.log(chalk.bold.blue("\n📝 Record Value\n"));
      console.log(JSON.stringify(value, null, 2));
      console.log();
    } catch (error) {
      spinner.fail("Failed to fetch record");
      console.error(chalk.red(error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

// ===========================================================================
// Parse and run
// ===========================================================================

program.parse();
