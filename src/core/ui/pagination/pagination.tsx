import { useEffect, useState } from "react";
import type { IPagination } from "../../model/pagination";
import { Icon, IconType } from "../icon/icon";
import { TextV2 } from "../text/text";
import { CrudFormLocalDbStore, CrudFormStore } from "../../store/base_store";

export const Pagination: React.FC<{
  store: CrudFormStore<any, any> | CrudFormLocalDbStore<any, any>;
}> = ({ store }) => {
  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <div
        onClick={() => {
          if (store.page?.currentPage === 1) {
            return;
          }
          store.prevPage();
        }}
        style={{
          display: store.page?.totalPages === 0 ? "none" : "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Icon type={IconType.chevronDown} />
      </div>
      <div style={{ width: 10 }} />

      {store.page?.currentPage === store.page?.totalPages ? (
        <TextV2
          text={store.page?.currentPage?.toString() ?? "0"}
          color="#64748B"
        />
      ) : (
        <>
          <NumberPagination
            pagination={store.page}
            selectPage={(page) => store.selectPage(page)}
          />
        </>
      )}
      <div style={{ width: 10 }} />

      <div
        onClick={() => {
          if (store.page?.currentPage !== store.page?.totalPages) {
            store.nextPage?.();
          }
        }}
        style={{
          display: store.page?.totalPages === 0 ? "none" : "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Icon type={IconType.chevronUp} />
      </div>
    </div>
  );
};
export const NumberPagination: React.FC<{
  pagination?: IPagination<any>;
  selectPage?: (value: number) => void;
}> = ({ pagination, selectPage }) => {
  const [numbers, setNumbers] = useState<
    { value: string; isActive: boolean }[]
  >([]);
  useEffect(() => {
    setNumbers(
      Array.from(
        {
          length:
            (pagination?.totalPages ?? 0) < 5 ? pagination!.totalPages : 5,
        },
        (_, i) => i + 1,
      ).map((el) => {
        return {
          value: `${el}`,
          isActive: pagination?.currentPage === el,
        };
      }),
    );
  }, [pagination]);
  return (
    <>
      {numbers.map((el, i) => (
        <TextV2
          key={i}
          onClick={() => selectPage?.(Number(el.value))}
          text={el.value}
          color={el.isActive ? "#020d1dff" : "#64748B"}
          style={{ margin: 5, cursor: "pointer" }}
        />
      ))}
    </>
  );
};
