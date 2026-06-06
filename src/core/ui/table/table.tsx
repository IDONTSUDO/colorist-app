import { TextV2 } from "../text/text";

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
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <tr>
        {columns
          .map((el) =>
            replacedColumns === undefined ? (
              <th
                style={{
                  textAlign: "justify",
                  backgroundColor: "#000",
                  color: "#fff",
                  padding: "8px 10px",
                  fontSize: 14,
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
                          fontSize: 14,
                          fontWeight: 500,
                          backgroundColor: "#000",
                          color: "#fff",
                          textAlign: "justify",
                          padding: "8px 10px",
                        }}
                      >
                        <TextV2 text={v.replace} color="#fff" />
                      </th>
                    ),
                    () => (
                      <th
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          backgroundColor: "#000",
                          color: "#fff",
                          textAlign: "justify",
                          padding: "8px 10px",
                          // borderRight: "1px solid #333",
                        }}
                      >
                        <TextV2 text={el} color="#fff" />
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
                  <TextV2 text={el.name} color="#fff" />
                </th>
              ))}
            </>,
          )}
      </tr>

      {source.map((el, i) => (
        <tr
          style={{
            height: 50,
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
                  style={{
                    fontSize: 14,
                    // borderRight: "1px solid #D0D0D0",
                    padding: "6px 10px",
                    color: "#000",
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
                    style={{
                      fontSize: 14,
                      // borderRight: "1px solid #D0D0D0",
                      padding: "6px 10px",
                      textAlign: "justify",
                      color: "#000",
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
  );
};
