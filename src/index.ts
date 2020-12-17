import {Tree, expr, treeSolve, insert, remove} from './Tree'

const arg = process.argv.slice(2)

if (arg.length === 1) {
    const tree = expr(arg[0])
    // tree.expr(arg[0])
    tree.print()
    console.log('here')
    console.log(treeSolve(tree))
    process.exit(0)
}

const expression = '1 + 1 * 2 + 1'
const tree = expr(expression)
// tree.expr(expr)
console.log('tree')
tree.print()
const tree1 = remove(tree,2, 1)
console.log('tree1')
tree1.print()
const tree2 = insert(tree1, 2, 2, 1)
console.log('tree2')
tree2.print()
console.log(treeSolve(tree2))
