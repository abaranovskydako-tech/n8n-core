#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
let N8N_HOST = process.env.N8N_HOST || '';
const N8N_API_KEY = process.env.N8N_API_KEY;
const WORKFLOWS_DIR = './workflows';
const results = { created: [], updated: [], errors: [] };

if (!N8N_HOST || !N8N_API_KEY) {
  console.error('❌ ERROR: N8N_HOST or N8N_API_KEY is not set');
  process.exit(1);
}

if (!N8N_HOST.startsWith('http://') && !N8N_HOST.startsWith('https://')) {
  N8N_HOST = 'http://' + N8N_HOST;
}

function makeRequest(protocol, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getWorkflowByName(name) {
  try {
    const url = new URL(N8N_HOST);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: `/api/v1/workflows?name=${encodeURIComponent(name)}`,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(protocol, options);
    if (response.status === 200 && response.body.data && response.body.data.length > 0) {
      return response.body.data[0];
    }
    return null;
  } catch (error) {
    console.error(`⚠️ Failed to fetch workflow: ${error.message}`);
    return null;
  }
}

async function deployWorkflow(filePath) {
  const fileName = path.basename(filePath, '.json');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = JSON.parse(content);
    workflow.active = false;
    
    const url = new URL(N8N_HOST);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const headers = {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Try to find existing workflow by name
    const existing = await getWorkflowByName(workflow.name || fileName);
    
    if (existing) {
      // UPDATE: PATCH request for existing workflow
      if (!existing.id) {
        console.log(`⚠️ Workflow ${workflow.name} missing ID — skipping update.`);
        results.errors.push({ file: fileName, error: 'Workflow ID not found' });
        return;
      }
      
      // Construct updateData with only necessary fields
      const updateData = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        
        settings: workflow.settings || {}
      };
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: `/api/v1/workflows/${existing.id}`,
        method: 'PUT',
        headers
      };
      
      const response = await makeRequest(protocol, options, updateData);
      if (response.status === 200) {
        results.updated.push(fileName);
        console.log(`✅ Updated: ${workflow.name || fileName}`);
      } else {
        throw new Error(`PATCH failed with status ${response.status}: ${response.body?.message || 'Unknown error'}`);
      }
    } else {
      // CREATE: POST request for new workflow
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: '/api/v1/workflows',
        method: 'POST',
        headers
      };
      
      const response = await makeRequest(protocol, options, workflow);
      if (response.status === 201) {
        results.created.push(fileName);
        console.log(`✨ Created: ${workflow.name || fileName}`);
      } else {
        throw new Error(`POST failed with status ${response.status}: ${response.body?.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    results.errors.push({ file: fileName, error: error.message });
    console.error(`❌ Error [${fileName}]: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting n8n workflow deployment...');
  console.log(`📁 Reading workflows from: ${WORKFLOWS_DIR}`);
  
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.log(`⚠️ Directory ${WORKFLOWS_DIR} does not exist`);
    return;
  }
  
  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('⚠️ No JSON files found in workflows directory');
    return;
  }
  
  console.log(`📋 Found ${files.length} workflow(s) to deploy`);
  
  for (const file of files) {
    await deployWorkflow(path.join(WORKFLOWS_DIR, file));
  }
  
  console.log('\n📊 Deployment Summary:');
  console.log(` Created: ${results.created.length}`);
  console.log(` Updated: ${results.updated.length}`);
  console.log(` Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(e => console.log(` - ${e.file}: ${e.error}`));
    process.exit(1);
  }
  
  console.log('\n✨ Deployment completed successfully!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
