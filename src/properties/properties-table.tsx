import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { NodeModel, NodeData } from "../node/node-model";
import { useStore } from "../App";
import Button from "@material-ui/core/Button";

type Props2 = {
  children: React.ReactNode;
};

export const PropertiesTable = observer(({ children }: Props2) => {
  return (
    <PropertiesTableStyled>
      <thead>
        <tr>
          <td>Property</td>
          <td>Value</td>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </PropertiesTableStyled>
  );
});

type Props<D extends NodeData<D, any, any>> = {
  self: NodeModel<D, any, any>;
};

export const PropertiesTableNode = observer(
  <D extends NodeData<D, any, any>>({ self }: Props<D>) => {
    const rootStore = useStore();
    return (
      <div className="col">
        <PropertiesTable>
          {Object.entries(self.data.spec).map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>
                <v.plotField name={k} model={self.data as any} />
              </td>
            </tr>
          ))}
        </PropertiesTable>
        <div style={{ margin: "0 3px" }}>
          {self.data.nInputs !== 0 && (
            <div className="row" key="inputs">
              <h4 style={{ margin: "3px 0 5px 0", width: "100px" }}>Inputs:</h4>
              <div>
                {self.inputs.map((v) => (
                  <Button
                    onClick={() => rootStore.selectConnection(v as any)}
                    key={v.from.key}
                    variant="outlined"
                    size="small"
                  >
                    {v.from.name}
                  </Button>
                ))}
                {self.inputs.length === 0 && "No inputs"}
              </div>
            </div>
          )}
          <div key="outputs" className="row">
            <h4 style={{ margin: "3px 0 5px 0", width: "100px" }}>Outputs:</h4>
            <div>
              {self.outputs.map((v) => (
                <Button
                  onClick={() => rootStore.selectConnection(v as any)}
                  key={v.to.key}
                  variant="outlined"
                  size="small"
                >
                  {v.to.name}
                </Button>
              ))}
              {self.outputs.length === 0 && "No outputs"}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const PropertiesTableStyled = styled.table`
  padding-bottom: 10px;
  thead {
    font-size: 1.1em;
    font-weight: bolder;
  }
  tr td {
    padding: 0;
  }
  tr td:first-child {
    padding-right: 15px;
    height: 32px;
  }
  tr td:last-child {
    margin: auto auto;
    padding-left: 10px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-self: center;
  }
`;