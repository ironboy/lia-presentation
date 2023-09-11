_export = async function makeHtml() {
  await marpCli([
    'index.md', '--html',
    '--allow-local-files',
    '--theme', 'theme.css'
  ]).catch(console.error);
}