import React, { useState, useEffect, useCallback } from "react";
import querystring from "querystring";

function usePagination(history, location, size = 10) {
  const { pathname, search } = location;
  const params = querystring.parse(search.slice(1));
  const initPage = parseInt(params.page, 10);
  const [page, setPage] = useState(initPage > 0 ? initPage : 1);

  useEffect(() => {
    if (!search.includes(`page=${page}`)) {
      history.replace(`${pathname}?page=${page}`);
    }
  }, [page]);

  const paginator = useCallback(
    arr => {
      let sliced = arr;
      if (arr.length > size) {
        sliced = arr.slice((page - 1) * size, page * size);
      }
      const pages = Math.ceil(arr.length / size);
      return [sliced, pages];
    },
    [page]
  );

  return [page, setPage, paginator];
}

export { usePagination };
