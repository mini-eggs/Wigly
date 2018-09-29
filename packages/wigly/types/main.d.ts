declare module "wigly" {
  export interface WiglyRenderStruct {
    readonly tag?: Readonly<WiglyComponent<any, any>> | string;
    readonly children?: Readonly<Array<Readonly<WiglyRenderStruct>>> | string;
    readonly [key: string]: any;
  }

  interface WiglySubContext<Props, State> {
    readonly props: Readonly<Props>;
    readonly children: Readonly<Array<WiglyRenderStruct>>;
  }

  interface WiglyContext<Props, State> {
    readonly props: Readonly<Props>;
    readonly state: Readonly<State>;
    readonly children: Readonly<Array<WiglyRenderStruct>>;
    setState<StateSubset extends keyof State>(
      state: ((prev: Readonly<State>) => Pick<State, StateSubset> | State) | Pick<State, StateSubset>,
      callback?: () => void
    ): void;
  }

  interface WiglyComponentBase<Props, State> {
    readonly mounted?: (this: WiglyContext<Props, State>, HTMLElement) => void;
    readonly updated?: (this: WiglyContext<Props, State>, HTMLElement) => void;
    readonly destroyed?: (this: WiglyContext<Props, State>, HTMLElement) => void;
    readonly render: (this: WiglyContext<Props, State>) => WiglyRenderStruct | undefined | null | false;
    readonly [key: string]: ((this: WiglyContext<Props, State>, any) => any);
  }

  interface WiglyComponentData<Props, State> extends WiglyComponentBase<Props, State> {
    readonly data: State extends object ? (this: WiglyContext<Props, State>) => State : never;
  }

  interface Empty {
    (): void;
  }

  export type WiglyComponent<Props = Empty, State = Empty> = State extends Empty
    ? WiglyComponentBase<Props, State>
    : WiglyComponentData<Props, State>;

  export function h(
    tag: "string",
    attr: { [key: string]: any },
    ...children: Array<Readonly<WiglyRenderStruct>>
  ): WiglyRenderStruct;

  export function render(component: WiglyComponent<any, any>, render: HTMLElement): HTMLElement;
}
