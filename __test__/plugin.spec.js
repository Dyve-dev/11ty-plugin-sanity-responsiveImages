  
const fs = require('fs');
const { join } = require('path');
const chai = require('chai');
const { spawn } = require('child_process');
const { Plugin } = require('../plugin/plugin');
const rimraf = require('rimraf');

chai.should();

describe('PLUGIN', () => {
  before((done) => {
    rimraf('./_site/**', (err) => {
      if (err) {
        console.error(err);
      }
      done();
    });
  });
  it('eleventy should run', (done) => {
    const eleventy = spawn('npx', ['eleventy']);
    eleventy.on('close', (code) => {
      code.should.equal(0);
      done();
    });
  });
 
});