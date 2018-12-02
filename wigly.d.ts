export as namespace wigly;

export interface VNode<Props = {}> {
  name: string;
  props: Props;
  children: Array<VNode>;
  element: Element | null;
  key: string | null;
  type: number;
}

export type Children = VNode | string | number | null;

export function h<Props>(
  name: string,
  props?: Props | null,
  ...children: Array<Children | Children[]>
): VNode<Props>;

export function render(
  rootComponent: VNode,
  container: Element
): Promise<Element>;

export function state<StateValue>(
  initialValue: StateValue | (() => StateValue)
): [StateValue, (nextValue: StateValue) => void];

export function effect(effectHandle: (el: Element) => Function | void): void;

declare global {
  namespace JSX {
    interface Element extends VNode<any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
