import {Tree, expr, treeSolve, insert} from './Tree'

const arg = process.argv.slice(2)

if (arg.length === 1) {
    const tree = expr(arg[0])
    // tree.expr(arg[0])
    tree.print()
    console.log('here')
    console.log(treeSolve(tree))
    process.exit(0)
}

const expression = '1 + 1 * 2'
const tree = expr(expression)
// tree.expr(expr)
tree.print()
tree.remove(2, 1)
tree.print()
const tree1 = insert(tree, 2, 2, 1)
tree1.print()
console.log(treeSolve(tree1))
