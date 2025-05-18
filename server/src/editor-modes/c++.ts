import { EditorMode } from '../server'

class CppMode extends EditorMode {

    name = 'Cpp Mode'
    HandleClientInput() {
        
    }
}










// function windowsPathToDocker(path: string): string {
//     const drive = path[0].toLowerCase();
//     return `/${drive}${path.slice(2).replace(/\\/g, '/')}`;
//   }

// import { execSync } from 'child_process';
// import { randomUUID } from 'crypto';
// import { Project, User } from "../../generated/prisma";
// import { IncomingMessage } from "http";
// import { stdin } from "process";

// /**
//  * Build and run the C++ executable in a Docker container with sandbox folder access.
//  * 
//  * @param cppExecutablePath - The absolute path to the C++ executable.
//  * @param cacheFolderPath - The path to the cache folder that contains unique exe subfolders.
//  * @returns The child process running the Docker container
//  */
// function buildAndRunCppSandbox(cppExecutablePath: string, cacheFolderPath: string){
//   const exeFolder = path.dirname(cppExecutablePath); // Folder containing .exe
//   const exeName = path.basename(cppExecutablePath);  // .exe filename
//   const sandboxFolder = path.join(exeFolder, 'clientFiles'); // The folder the exe will access
  
//   // Ensure that the sandbox folder exists
//   if (!fs.existsSync(sandboxFolder)) {
//     console.error(`Sandbox folder does not exist: ${sandboxFolder}`);
//     return;
//   }

//   // Create a temporary directory for building the Docker image
// //   const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-docker-'));
//   const dockerfilePath = path.join(cacheFolderPath, 'Dockerfile');
//   const containerExePath = `${exeName}`;
//   const imageTag = `cpp-tool-${randomUUID()}`; // Unique image tag to avoid collisions

//   // 1. Copy the executable to the temporary folder
//   // 2. Write the Dockerfile to the temp directory
//   const dockerfileContents = `
// FROM mcr.microsoft.com/windows/servercore:ltsc2022
// WORKDIR .
// COPY ${exeName} .
// COPY . .
// #CMD ["${containerExePath.replace(/\\/g, '\\\\')}"]

// ENTRYPOINT CMD ["./main.exe"]
//   `.trim();

//   fs.writeFileSync(dockerfilePath, dockerfileContents);





  
//   // 3. Build the Docker image
//   console.log(`Building Docker image: ${imageTag}`);
//   try {
//     execSync(`docker build -t ${imageTag} "${cacheFolderPath}"`, { stdio: 'inherit' });
//   } catch (error) {
//     console.error('Error building Docker image:', error);
//     return;
//   }
 


//   const dockerSandboxPath = windowsPathToDocker(cacheFolderPath);
//   // 4. Run the Docker container with access to the sandbox folder
// const runCommand = `docker run --rm -v "${dockerSandboxPath}":"${dockerSandboxPath}" -w "${dockerSandboxPath}" ${imageTag}`;

//   console.log(`Running Docker container with access to ${sandboxFolder}`);
  
//   // Return the child process for external handling
//   const childProcess = spawn(runCommand, { shell: true });
// // const childProcess = spawn('docker', ['run', '--rm', ])

//   childProcess.stdout.on('data', (data) => {
//     console.log(`Output: ${data}`);
//   });

//   childProcess.stderr.on('data', (data) => {
//     console.error(`Error: ${data}`);
//   });

//   childProcess.on('close', (code) => {
//     console.log(`Child process exited with code ${code}`);
//     // Cleanup the Docker image after the process finishes
//     console.log(`Cleaning up image: ${imageTag}`);
//     try {
//       execSync(`docker rmi ${imageTag}`, { stdio: 'ignore' });
//     } catch (error) {
//       console.error('Error cleaning up Docker image:', error);
//     }
//   });

//   return childProcess as ChildProcess; // Return the child process so it can be handled externally
// }
