import { TextV2 } from "../text/text";
const tdHeight = 20;
const thHeight = 20;
export const CoreTable: React.FC<{
  columns: string[];
  source: object[];
  missingKey?: string[];
  replacedJSXColumns?: { name: string; jsx: (el: any) => React.ReactNode }[];
  addingColumns?: { name: string; jsx: (el: any) => React.ReactNode }[];
  replacedColumns?: { name: string; replace: string }[];
  onClick?: (index: number) => void;
  mappedColumns:
    | { name: string; mapper: (date: any) => React.ReactNode }[]
    | undefined;
}> = ({
  columns,
  source,
  onClick,
  replacedColumns,
  mappedColumns,
  missingKey,
  addingColumns,
}) => {
  return (
    <div
      style={{
        height: "calc(100% - 50px)",
        border: "1px solid oklch(92.9% 0.013 255.508)",
        borderRadius: 6,
        overflow: "auto",
      }}
    >
      <table
        style={{
          // height: "100%",
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Roboto, sans-serif",
          borderRadius: 6,
        }}
      >
        <tr>
          {columns
            .map((el, i) =>
              replacedColumns === undefined ? (
                <th
                  style={{
                    height: thHeight,
                    textAlign: "justify",
                    backgroundColor: "#000",
                    color: "#fff",
                    padding: "8px 10px",
                    fontSize: 14,
                    borderRadius: 6,
                    fontWeight: 500,
                    // borderRight: "1px solid #333",
                  }}
                >
                  {el}
                </th>
              ) : (
                <>
                  {replacedColumns
                    .rFind<{ name: string; replace: string }>(
                      (element) => element.name === el,
                    )
                    .fold(
                      (v) => (
                        <th
                          style={{
                            height: thHeight,
                            fontSize: 14,
                            fontWeight: 500,
                            backgroundColor: "#000",
                            color: "#fff",
                            textAlign: "justify",
                            padding: "8px 10px",
                            borderTopLeftRadius: i === 0 ? 4 : undefined,
                            borderTopRightRadius:
                              i === replacedColumns.length - 2 ? 4 : undefined,
                          }}
                        >
                          <TextV2 text={v.replace.toUpperCase()} color="#fff" />
                        </th>
                      ),
                      () => (
                        <th
                          style={{
                            height: thHeight,
                            fontSize: 14,
                            fontWeight: 500,
                            backgroundColor: "#000",
                            color: "#fff",
                            textAlign: "justify",
                            padding: "8px 10px",
                            // borderRight: "1px solid #333",
                          }}
                        >
                          <TextV2 text={el.toUpperCase()} color="#fff" />
                        </th>
                      ),
                    )}
                </>
              ),
            )
            .add(
              <>
                {addingColumns?.map((el) => (
                  <th
                    style={{
                      height: thHeight,
                      width: "min-content",
                      fontSize: 14,
                      fontWeight: 500,
                      padding: "8px 10px",
                      backgroundColor: "#000",
                      color: "#fff",
                      textAlign: "justify",
                      // borderRight: "1px solid #333",
                    }}
                  >
                    <TextV2 text={el.name.toUpperCase()} color="#fff" />
                  </th>
                ))}
              </>,
            )}
        </tr>

        {source.map((el, i) => (
          <tr
            style={{
              // height: 50,

              backgroundColor: i % 2 === 0 ? "#fff" : "#F5F5F5",
              borderBottom: "1px solid #D0D0D0",
            }}
          >
            {Object.entries(el)
              .map(([k, v]) => {
                const hasMissKey = missingKey?.hasIncludeElement(k) ?? false;
                const item = (el as any)[k];

                if (hasMissKey) return <></>;

                return (
                  <td
                    className="2"
                    style={{
                      fontSize: 14,
                      // borderRight: "1px solid #D0D0D0",
                      padding: "6px 10px",
                      color: "#000",
                      height: tdHeight,
                    }}
                    onClick={() => onClick?.(i)}
                  >
                    {mappedColumns
                      ?.rFind<{ name: string; mapper: (date: any) => string }>(
                        (element) => element.name === k,
                      )
                      .fold(
                        (s) => <>{s.mapper((el as any)[k])}</>,
                        (_) => <>{item}</>,
                      ) ?? <>{v}</>}
                  </td>
                );
              })
              .add(
                <>
                  {addingColumns?.map((element) => (
                    <td
                      className="3"
                      style={{
                        fontSize: 14,
                        // borderRight: "1px solid #D0D0D0",
                        padding: "6px 10px",
                        textAlign: "justify",
                        color: "#000",
                        height: tdHeight,
                      }}
                    >
                      {element.jsx(el)}
                    </td>
                  ))}
                </>,
              )}
          </tr>
        ))}
      </table>
    </div>
  );
};
