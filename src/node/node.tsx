import { observer } from "mobx-react-lite";
import React from "react";
import Draggable from "react-draggable";
// import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import styled from "styled-components";
import { NodeModel } from "./node-model";
import { useStore } from "../App";

export type Shape = (number | undefined)[];

const StyledNode = styled.div`
  z-index: 1;
  cursor: pointer;
  position: absolute;
  box-shadow: 0 1px 4px 1px #eee;
  background: #fff;
  border-radius: 6;
  border: 1.5px solid;
`;

type NodeViewProps = { node: NodeModel<any, any, any> };
export const NodeView: React.FC<NodeViewProps> = observer((params) => {
  const { node, children } = params;
  const rootStore = useStore();
  // const onDrag = React.useCallback(
  //   (_: DraggableEvent, data: DraggableData) => {
  //     node.move(data.deltaX, data.deltaY);
  //   },
  //   [node]
  // );
  const selectingInput = rootStore.selectingInputFor !== undefined;
  const isValidInput =
    selectingInput && rootStore.selectingInputFor!.data.isValidInput(node);
  const isSelected = rootStore.selectedNode === node;

  const onClick = React.useCallback(
    (_: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (selectingInput) {
        if (isValidInput) {
          rootStore.assignInput(node);
        }
      } else {
        rootStore.selectNode(node);
      }
    },
    [rootStore, node, selectingInput, isValidInput]
  );

  if (node.isHidden && !rootStore.showHidden) {
    return <></>;
  }
  // const [_, setDivRef] = React.useState<HTMLDivElement | null>(null);
  const { x, y } = node;

  let style: React.CSSProperties = {};
  if (isSelected) {
    style["boxShadow"] = "rgb(110 110 110) 1px 1.5px 3px 1px";
  }
  if (selectingInput) {
    style["cursor"] = isValidInput ? "pointer" : "not-allowed";
  }
  if (node.isHidden) {
    style["opacity"] = 0.1;
  }

  return (
    <Draggable
      // onDrag={onDrag}
      disabled={true}
      position={{
        // TODO: improve x, y with support for nested children
        x: x - (node.data.parent?.x ?? 0),
        y: y - (node.data.parent?.y ?? 0),
      }}
      bounds="parent"
    >
      <StyledNode
        ref={(e) => {
          if (e === null) return;
          node.setElement(e);
        }}
        onClick={onClick}
        style={style}
      >
        <node.data.View children={children} />
      </StyledNode>
    </Draggable>
  );
});
