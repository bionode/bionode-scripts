#!/usr/bin/env node

// Copyright 2016 Bruno Vieira - MIT License

// Add taxonomic information to a tab separated BLAST output file
// Usage: node addTaxonToBlast.js blast_results.bln class > blast_results.withClass.bln

// Modules
var fs = require('fs')
var split = require('split2')
var through = require('through2-concurrent')
var ncbi = require('bionode-ncbi')

// Arguments
var file = process.argv[2]
var taxonToAdd = process.argv[3]

// NCBI query function
var queryStream = through.obj(query)

function query(line, encoding, next) {
  uid = line.split('\t')[16]
  ncbi.fetch('taxonomy', uid + '[uid]', (taxonomy) => {
    try {
      var taxons = taxonomy[0].TaxaSet.Taxon[0].LineageEx[0].Taxon
      var taxClass = taxons.filter(t => t.Rank[0] === taxonToAdd)[0].ScientificName[0]
    }
    catch (error) {
      var taxClass = 'NA'
    }
    this.push(line + '\t' + taxClass.toString() + '\n')
    next()
  })
}

// Pipeline
fs.createReadStream(file)
.pipe(split())
.pipe(queryStream)
.pipe(process.stdout)
