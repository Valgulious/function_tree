import {Tree, expr, treeSolve, insert, remove} from './Tree'

const arg = process.argv.slice(2)

if (arg.length === 1) {
    const tree = expr(arg[0])
    tree.print()
    console.log(treeSolve(tree))
    process.exit(0)
}

const expression = '1 + 2 * (3 + 4)'
const tree = expr(expression)
// console.log('tree')
// tree.print()
// const tree1 = remove(tree,3, 4)
console.log('tree1')
tree.print()
console.log(tree.height)
console.log(treeSolve(tree))
// const tree2 = insert(tree, '-', 1, 1)
// console.log('tree2')
// tree2.print()
// const tree3 = insert( insert( insert( insert(expr(expression), 11, 2, 1), '+', 3, 3), 5, 4, 5), 6, 4, 6)
// tree3.print()
// console.log(treeSolve(tree1))
