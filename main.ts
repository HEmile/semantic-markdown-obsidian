import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {SemanticMarkdownSettings, SemanticMarkdownSettingTab} from "./settings";
import { exec, ChildProcess } from 'child_process';
import {promisify} from "util";

// I got this from https://github.com/SilentVoid13/Templater/blob/master/src/fuzzy_suggester.ts
const exec_promise = promisify(exec);

export default class SemanticMarkdownPlugin extends Plugin {
	public settings: SemanticMarkdownSettings;
	public server_process: ChildProcess;

	async onload() {


		this.addCommand({
			id: 'restart-server',
			name: 'Restart Semantic Markdown server',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				this.restart();

			}
		});


		this.addSettingTab(new SemanticMarkdownSettingTab(this.app, this));

		await this.initialize();
	}

	public async restart() {
		new Notice("Restarting semantic markdown server.");
		await this.shutdown();
		await this.initialize();
	}

	public async initialize() {
		console.log('Initializing semantic markdown');
		try {
			// await exec_promise("python3 -m venv smd", {timeout: 10000000});
			let res = await exec_promise("python3 -m venv smd", {timeout: 10000000});
			// await exec_promise("source activate threes-ai", {timeout: 10000000});
			let {stdout, stderr} = await exec_promise("source smd/bin/activate && " +
				"pip3 install --upgrade semantic-markdown-converter", {timeout: 10000000});
			console.log(stderr);
			let server_command = "source smd/bin/activate && " +
				"smds --password " + this.settings.password + (this.settings.index_content ? "--index_content" : "");
			this.server_process = exec(server_command);
			new Notice("Initializing server.");
			this.addStatusBarItem().setText('Initializing Neo4j Server');
		}
		catch(error) {
			console.log("Error during initialization of semantic markdown: \n", error);
			new Notice("Error during initialization of the Semantic Markdown server. Check the console for crash report.");
		}
	}

	public async shutdown() {
		this.server_process.kill();
	}


	async onunload() {
		console.log('unloading plugin');
		await this.shutdown();
	}
}

