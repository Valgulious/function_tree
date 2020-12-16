export class Node {
    value: string | number
    left: Node | null
    right: Node | null

    constructor(nodeValue: string | number = ' ', nodeLeft: Node | null = null, nodeRight: Node | null = null) {
        this.value = nodeValue
        this.left = nodeLeft
        this.right = nodeRight
    }
}
