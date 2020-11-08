
export interface Component {
    name: string,
    port: number,
    schema: string
}

export interface IComponentRegistry {
    getAllComponents(): Component[]
    getComponentByName(name): Component
    getPeersOfComponent(component: Component): Component[]

    pushOnNewComponent(component: Component)
    pushMultipleComponents(components: Component[])

    removeComponent(component: Component)
}
