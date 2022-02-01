"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProof = exports.generateTree = void 0;
const content_hash_tree_1 = require("./content-hash-tree");
function generateTree(items) {
    const sortedItems = items.sort();
    // construct a tree
    console.log('[LIB] Generating tree')
    const tree = new content_hash_tree_1.ContentHashTree(sortedItems);
    console.log('[LIB] Tree generated')

    // generate proofs
    let proofs = {}
    let blob  = new Blob([], {type: 'text/plain'})

    let index = 0
    let count = 0

    console.log('[LIB] Iterating and computing items')

    for(const item of sortedItems) {
        if(index % 1000 === 0) {
            console.log('[LIB] Computes', index)
        }

        // const proof = JSON.stringify(tree.getProof(index, item.urn, item.contentHash))
        // const proof = tree.getProof(index, item.urn, item.contentHash)
        // proofs[item.urn] = {
        //     index,
        //     contentHash: item.contentHash,
        //     proof: new Blob([proof], {'type': 'text/plain'})
        // }
        proofs[item.urn] = {
            index,
            contentHash: item.contentHash,
            proof: tree.getProof(index, item.urn, item.contentHash)
        }

        index += 1

        // if(index % 100000 === 0) {
        if(index % 1000 === 0) {
            count += 1

            blob = new Blob([blob, JSON.stringify(proofs)], {type: 'application/json'})
            console.log('CLEANUP', count)

            proofs = undefined
            proofs = {}
        }
    }

    console.log('[LIB] Finished computing')

    const reader = new FileReader();

    reader.onload = function() {
        console.log(this.result)
    }
    
    reader.readAsText(blob)

    return {
        merkleRoot: tree.getHexRoot(),
        total: items.length,
        proofs
    };
}
exports.generateTree = generateTree;
function verifyProof(index, urn, contentHash, proof, root) {
    return content_hash_tree_1.ContentHashTree.verifyProof(index, urn, contentHash, proof, root);
}
exports.verifyProof = verifyProof;
//# sourceMappingURL=index.js.map