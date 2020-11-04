
export interface Component {
    name: string,
    port: number
}

export interface IComponentRegistry {
    getAllComponents(): Component[]
    getComponentByName(name): Component
    getPeersOfComponent(component: Component)

    pushOnNewComponent(component: Component)
    pushMultipleComponents(components: Component[])

    removeComponent(component: Component)
}
