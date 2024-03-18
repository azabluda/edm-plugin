import { Plugin, TFile, TFolder } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';
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
				var drop = await this.forceFolder('_edm');
				var dropFiles = drop.children.filter(f => f instanceof TFile) as TFile[]
				var sorted = await this.forceFolder('Sorted');
				var attach = await this.forceFolder('Sorted/_resources');
				for (const file of dropFiles) {
					const attName = `${attach.name}/${uuidv4()}.${file.extension}`;
					const attPath = `${sorted.path}/${attName}`;
					const ctime = format(new Date(file.stat.ctime), 'yyyy-MM-dd');
					const mdPath = `${sorted.path}/${ctime} ${file.basename}.md`;
					const mdData = `---
tags:
---
![[${attName}]]`
					await this.app.vault.create(mdPath, mdData)
					await this.app.vault.rename(file, attPath);
				}
			}
		});
	}

	onunload() {
	}
}
