const totalSize = 1024 * 1024;

const _window = window as any;

// export class FileSystem {
//   constructor(fileSystem: any){
//     this.fileSystem = fileSystem;
//   }

//   fileSystem: any;
  
//   readFile(fileUrl: string): Promise<string> {
//     return new Promise(async (resolve, reject) => {
//       const fileEntry = await this.getFileEntryByUrl(fileUrl, {});
//       fileEntry.file((file: any) => {
//         const reader = new FileReader();
//         reader.onload = () => {
//           resolve(reader.result as string);
//         };
//         reader.onerror = () => {
//           reject('Read failed: ' + reader.error);
//         };
//         reader.readAsText(file);
//       }, (err: any) => {
//         reject('GetFile failed: ' + err.toString());
//       });
//     });
//   }
//   writeFile(fileUrl: string, text: string, options: {create?: boolean, exclusive?: boolean} = {create: true}): Promise<any> {
//     return new Promise(async (resolve, reject) => {
//       const fileEntry = await this.getFileEntryByUrl(fileUrl, options);
//       fileEntry.remove(async () => {
//         const fileEntry = await this.getFileEntryByUrl(fileUrl, options);
//         fileEntry.createWriter((fileWriter: any) => {
//           fileWriter.onwriteend = (e: any) => {
//             resolve(e);
//           };
//           fileWriter.onerror = (err: any) => {
//             reject('Write failed: ' + err.toString());
//           };
//           fileWriter.write(new Blob([text]));
//         }, (err: any) => {
//           reject('CreateWriter failed: ' + err.toString());
//         });
//       }, (err: any) => {
//         reject('FileRemove failed: ' + err.toString());
//       });
//     });
//   }
//   getFileEntryByUrl(fileUrl: string, options: object = {}, parentDirectoryEntry: any = this.fileSystem.root): Promise<any> {
//     return new Promise((resolve, reject) => {
//       if (this.fileSystem) {
//         if (!fileUrl) {
//           reject(`FileUrl can't be empty`);
//           return;
//         }
//         if (fileUrl.indexOf('/') == 0) {
//           fileUrl = fileUrl.slice(1);
//         }
//         const res = fileUrl.match(/([^\/]*)\/(?=(.*))/);
//         if (res && res.length === 3) {
//           parentDirectoryEntry.getDirectory(res[1], options, async (directoryEntry: any) => {
//             try {
//               const fileEntry = await this.getFileEntryByUrl(res[2], options, directoryEntry);
//               resolve(fileEntry);
//             }
//             catch (err) {
//               reject(err);
//             }
//           }, (err: any) => {
//             reject('GetDirectoryEntry failed: ' + err.toString());
//           });
//         }
//         else {
//           parentDirectoryEntry.getFile(fileUrl, options, (fileEntry: any) => {
//             resolve(fileEntry);
//           }, (err: any) => {
//             reject('GetFileEntry failed: ' + err.toString());
//           });
//         }
//       }
//       else {
//         reject(`Property 'fileSystem' hadn't been initialized`);
//       }
//     });
//   }
// }

// function getFileSystem(size: number): Promise<FileSystem> {
//   return new Promise((resolve, reject) => {
//     (navigator as any).webkitPersistentStorage.requestQuota(totalSize, (fileSystemSize: any) =>{
//       const requestFileSystem = _window.requestFileSystem || _window.webkitRequestFileSystem;
//       requestFileSystem((Window as any).PERSISTENT, Math.min(size, totalSize), (fs: any) =>{
//         const fileSystem = new FileSystem(fs);
//         resolve(fileSystem);
//       }, (err: any) =>{
//         reject('RequestFileSystem failed: ' + err.toString());
//       });
//     }, (err: any) => {
//       reject('RequestQuota failed: ' + err.toString());
//     });
//   });
// }


export class FileSystem {
  constructor(){}
  
  async readFile(fileUrl: string): Promise<string> {
    return localStorage.getItem(fileUrl) as string;
  }
  async writeFile(fileUrl: string, text: string, options: {create?: boolean, exclusive?: boolean} = {create: true}): Promise<any> {
    localStorage.setItem(fileUrl, text);
  }
}

async function getFileSystem(size: number): Promise<FileSystem> {
  return new FileSystem();
}

export default {
  getFileSystem,
};