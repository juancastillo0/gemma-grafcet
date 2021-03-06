import { action, computed, IObservableArray, observable, ObservableMap } from "mobx";
import { SnapshotIn } from "mobx-state-tree";
import { FieldSpec } from "../fields";
import { GlobalData, RootStoreModel, JsonType } from "../canvas/store";
import { ConnectionJson, NodeJson } from "../canvas/persistence";
import { ResizeObserver } from "@juggle/resize-observer";

export type OperationI<
  V extends { [key: string]: FieldSpec },
  D extends NodeData<D, G, any>,
  G extends GlobalData<D>
> = {
  [key in keyof V]: SnapshotIn<ReturnType<V[key]["mobxProp"]>>;
} & {
  NAME: string;
  spec: V;
  nInputs: number;
  errors: ObservableMap<keyof V, string>;
};

export const mobxDecorators = <V extends { [key: string]: FieldSpec }>(
  spec: V
) => {
  return {
    ...Object.keys(spec).reduce((p, c) => {
      p[c as keyof V] = observable;
      return p;
    }, {} as { [key in keyof V]: PropertyDecorator }),
    errors: observable,
  };
};

export type ConnectionPosition =
  | { top: number; left: number }
  | { top: number; right: number }
  | { bottom: number; left: number }
  | { bottom: number; right: number };

export interface NodeData<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<G>
> {
  isValidInput(input: NodeModel<D, G, C>): boolean;
  nInputs: number;
  spec: { [key: string]: FieldSpec };
  // TODO: ObservableMap<keyof V, string>
  errors: ObservableMap<string, string>;
  View: React.FC;
  toJson: JsonType;
  parent?: NodeModel<D, G, C>;
  connectionStartPosition?: () => undefined | ConnectionPosition;
}

export type ConnectionData<D> = {
  ConnectionView: React.FunctionComponent;
  connectionText: { text: string; style?: React.CSSProperties }[];
  toJson: JsonType;
};

export class ConnModel<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<G>
> {
  constructor(
    public from: NodeModel<D, G, C>,
    public to: NodeModel<D, G, C>,
    dataBuilder: (connection: ConnModel<D, G, C>, json?: JsonType) => C,
    json?: Partial<ConnectionJson>
  ) {
    this.data = dataBuilder(this, json?.data);
    this.isHidden = json?.isHidden ?? false;
    this.innerPoints = observable.array<{ x: number; y: number }>(
      json?.innerPoints ?? []
    );
  }

  data: C;
  @observable
  isHidden: boolean;
  get graph(): RootStoreModel<D, G, any> {
    return this.from.graph;
  }

  @computed
  get isSelected(): boolean {
    return this.from.graph.selectedConnection === this;
  }

  @computed
  get toJson(): ConnectionJson {
    return {
      from: this.from.key,
      to: this.to.key,
      data: this.data.toJson,
      isHidden: this.isHidden,
      innerPoints: [...this.innerPoints.map((p) => ({ ...p }))],
    };
  }

  @observable
  innerPoints: IObservableArray<{
    x: number;
    y: number;
  }>;
}

export type LineData = {
  length: number;
  axis: "vert" | "hori";
};

export class NodeModel<
  D extends NodeData<D, G, C>,
  G extends GlobalData<D>,
  C extends ConnectionData<G>
> {
  constructor(
    public graph: RootStoreModel<D, G, any>,
    d: {
      key: string;
      name: string;
      x: number;
      y: number;
      isHidden?: boolean;
      dataBuilder: (node: NodeModel<D, G, C>, json?: JsonType) => D;
      data?: JsonType;
    }
  ) {
    this.key = d.key;
    this.name = d.name;
    this.x = d.x;
    this.y = d.y;
    this.isHidden = d.isHidden ?? false;
    this.data = d.dataBuilder(this, d.data);
  }

  resizeObserver?: ResizeObserver;
  element?: HTMLElement;
  @observable
  key: string;
  @observable
  name: string;
  @observable
  x: number;
  @observable
  y: number;
  @observable
  width: number = 60;
  @observable
  height: number = 60;
  @observable
  data: D;
  @observable
  isHidden: boolean;
  @observable
  inputs = observable.array<ConnModel<D, G, C>>();
  @computed
  get inputNodes(): NodeModel<D, G, C>[] {
    return this.inputs.map((c) => c.from);
  }
  @observable
  outputs = observable.array<ConnModel<D, G, C>>();
  @computed
  get outputNodes(): NodeModel<D, G, C>[] {
    return this.outputs.map((c) => c.to);
  }

  @action
  addInput(conn: ConnModel<D, G, C>) {
    this.inputs.push(conn);
    conn.from.outputs.push(conn);
  }

  @action
  addOutput(conn: ConnModel<D, G, C>) {
    this.outputs.push(conn);
    conn.to.inputs.push(conn);
  }

  @action
  move = (dx: number, dy: number) => {
    this.x += dx;
    this.y += dy;
  };
  @action
  setSize = (rect: DOMRect) => {
    this.width = rect.width;
    this.height = rect.height;
  };
  @action
  setName = (name: string) => {
    this.name = name;
  };
  setElement = (element: HTMLElement) => {
    this.setSize(element.getBoundingClientRect());

    if (this.element !== element) {
      if (this.resizeObserver !== undefined) {
        this.resizeObserver.disconnect();
      }
      this.element = element;
      this.resizeObserver = new ResizeObserver((entries, observer) => {
        this.setSize(element.getBoundingClientRect());
      });
      this.resizeObserver.observe(element);
    }
  };

  @computed
  get toJson(): NodeJson {
    return {
      key: this.key,
      name: this.name,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      isHidden: this.isHidden,
      data: this.data.toJson,
    };
  }
}
