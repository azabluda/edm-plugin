import { Plugin, Notice, TFile, TFolder } from 'obsidian';
import { format } from 'date-fns';

export default class EdmPlugin extends Plugin {

	private async forceFolder(path: string) : Promise<TFolder> {
		return this.app.vault.getFolderByPath(path) ?? await this.app.vault.createFolder(path);
	}

	onload() {
		this.addCommand({
			id: 'process-edm-dropbox',
			name: 'Process _edm dropbox',
			callback: async () => {
				const drop = await this.forceFolder('_edm');
				const dropFiles = drop.children.filter(f => f instanceof TFile) as TFile[]
				const sorted = await this.forceFolder('Sorted');
				for (const file of dropFiles) {
					const ctime = format(new Date(file.stat.ctime), 'yyyy-MM-dd');
					const mdBaseName = `${ctime} ${file.basename}`
					const attDir = await this.forceFolder(`${sorted.path}/_attachments/${mdBaseName}`);
					const mdPath = `${sorted.path}/${mdBaseName}.md`;
					if (this.app.vault.getFileByPath(mdPath) != null) {
						new Notice(`Note '${mdPath}' already exists 👎😕`);
						return;
					}
					const mdData = `---
tags:
  - _UNSORTED_
---
![[${attDir.path}/${file.name}]]`
					const msg = `Note '${mdPath}' created for '${file.name}' 🙂👍`;
					await this.app.vault.create(mdPath, mdData)
					await this.app.vault.rename(file, `${attDir.path}/${file.name}`);
					new Notice(msg);
	
				}
			}
		});
	}

	onunload() {
	}
}
