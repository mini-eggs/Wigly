type falsy = undefined | null | false;
type vdom = Function | RenderStruct | string;

interface RenderStruct {
  readonly tag?: Readonly<IComponent<any, any>> | string;
  readonly children?: Readonly<Array<Readonly<RenderStruct>>> | string;
  readonly [key: string]: any;
}

interface Context<Props, State> {
  readonly props: Readonly<Props>;
  readonly state: Readonly<State>;
  setState<StateSubset extends keyof State>(
    state: ((prev: Readonly<State>) => Pick<State, StateSubset> | State) | Pick<State, StateSubset>,
    callback?: () => void
  ): void;
}

interface Instance<Props, State> {
  readonly data: (this: { readonly props: Readonly<Props> }) => State;
  readonly mounted?: (this: Context<Props, State>, el: HTMLElement) => void;
  readonly updated?: (this: Context<Props, State>, el: HTMLElement) => void;
  readonly destroyed?: (this: Context<Props, State>, el: HTMLElement) => void;
  readonly [key: string]: ((this: Context<Props, State>, any) => any);
  readonly render: (this: Context<Props, State>) => RenderStruct | falsy;
}

export declare interface IComponent<Props, State> {
  (props: Props): Instance<Props, State>;
}

export declare function h(tag: vdom, attr: object, ...children: Array<vdom>): RenderStruct;
export declare function component<Props, State>(sig: Instance<Props, State>): (props: Props) => Instance<Props, State>;
export declare function render(root: IComponent<{}, {}>, container: HTMLElement): HTMLElement;
export {};
