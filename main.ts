import { Plugin, Notice, TAbstractFile, TFile, TFolder } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export default class EdmPlugin extends Plugin {

	private async forceFolder(path: string) : Promise<TFolder> {
		return this.app.vault.getFolderByPath(path) ?? await this.app.vault.createFolder(path);
	}

	onload() {
		this.app.vault.on('create', async (fs: TAbstractFile) => {
			await new Promise(resolve => setTimeout(resolve, 100));
			const file = fs as TFile;
			const drop = await this.forceFolder('_edm');
			if (file && file.parent?.path == drop.path) {
				const sorted = await this.forceFolder('Sorted');
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
		})
	}

	onunload() {
	}
}
