#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const N8N_HOST = process.env.N8N_HOST;
const N8N_API_KEY = process.env.N8N_API_KEY;
const WORKFLOWS_DIR = './workflows';

const results = {
  created: [],
  updated: [],
  errors: []
};

if (!N8N_HOST || !N8N_API_KEY) {
  console.error('❌ ERROR: N8N_HOST or N8N_API_KEY is not set');
  process.exit(1);
}

// Helper function to ensure URL has protocol
function ensureProtocol(urlString) {
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return 'http://' + urlString;
  }
  return urlString;
}

function makeRequest(protocol, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
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
    const urlString = ensureProtocol(N8N_HOST);
    const url = new URL(urlString);
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
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication failed (${response.status}): Invalid API key`);
    }
    if (response.status === 200 && response.body.data && response.body.data.length > 0) {
      return response.body.data[0];
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to fetch workflow: ${error.message}`);
  }
}

async function deployWorkflow(filePath) {
  const fileName = path.basename(filePath, '.json');
  
  try {
    // Validate JSON
    const content = fs.readFileSync(filePath, 'utf8');
    let workflow;
    try {
      workflow = JSON.parse(content);
    } catch (e) {
      throw new Error(`Invalid JSON in ${fileName}: ${e.message}`);
    }
    
    // Check if workflow exists
    const existing = await getWorkflowByName(workflow.name || fileName);
    
    const urlString = ensureProtocol(N8N_HOST);
    const url = new URL(urlString);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const baseOptions = {
      hostname: url.hostname,
      port: url.port,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    if (existing) {
      // Update existing workflow
      const options = {
        ...baseOptions,
        path: `/api/v1/workflows/${existing.id}`,
        method: 'PUT'
      };
      workflow.active = false; // Never activate automatically
      
      const response = await makeRequest(protocol, options, workflow);
      if (response.status === 200) {
        results.updated.push(fileName);
        console.log(`✅ Updated: ${fileName}`);
      } else {
        throw new Error(`Update failed with status ${response.status}`);
      }
    } else {
      // Create new workflow
      const options = {
        ...baseOptions,
        path: '/api/v1/workflows',
        method: 'POST'
      };
      workflow.active = false; // Never activate automatically
      
      const response = await makeRequest(protocol, options, workflow);
      if (response.status === 201) {
        results.created.push(fileName);
        console.log(`✨ Created: ${fileName}`);
      } else {
        throw new Error(`Create failed with status ${response.status}`);
      }
    }
  } catch (error) {
    results.errors.push({ file: fileName, error: error.message });
    console.error(`❌ Error ${fileName}: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting n8n workflow deployment...');
  console.log(`📁 Reading workflows from: ${WORKFLOWS_DIR}`);
  
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.log(`⚠️  Directory ${WORKFLOWS_DIR} does not exist`);
    return;
  }
  
  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('⚠️  No JSON files found in workflows directory');
    return;
  }
  
  console.log(`📋 Found ${files.length} workflow(s) to deploy`);
  
  for (const file of files) {
    const filePath = path.join(WORKFLOWS_DIR, file);
    await deployWorkflow(filePath);
  }
  
  // Print summary
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
