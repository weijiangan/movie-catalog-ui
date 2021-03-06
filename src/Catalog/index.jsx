import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from "react";
import { Link } from "react-router-dom";
import { usePagination } from "../hooks/usePagination";
import { cache } from "../utils";

import theme from "../app.css";
import styles from "./styles.css";

async function loadData() {
  const data = await fetch(
    "https://cdn-discover.hooq.tv/v1.2/discover/feed?region=ID&page=1&perPage=20"
  ).then(response => response.json());
  return Promise.resolve(data);
}

function Catalog({ history, location, ...props }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");
  const [page, setPage, paginator] = usePagination(history, location);

  useEffect(() => {
    (async function run() {
      // cache API response during development to prevent spamming the API
      const data = await cache("catalog", loadData);
      setCampaigns(prevState => prevState.concat(data.data));
    })();
  }, []);

  const handleSearch = useCallback(
    event => {
      setPage(1);
      setFilter(event.target.value);
    },
    [setPage, setFilter]
  );

  const filterResults = useMemo(() => {
    return campaigns
      .filter(item => item.type === "Multi-Title-Manual-Curation")
      .filter(cmp => {
        return cmp.row_name.toLowerCase().includes(filter.toLowerCase());
      });
  }, [campaigns, filter]);

  const [pageItems, pages] = useMemo(() => {
    const tmp = paginator(filterResults);
    if (tmp[0][0]) setSelected(tmp[0][0].data[0].id);
    return tmp;
  }, [filterResults, page]);

  const containerRef = useRef(window.innerWidth);

  const computedMargin =
    (window.innerWidth - containerRef.current.offsetWidth) / 2;

  return (
    <>
      <div className={styles.topSection}>
        <div ref={containerRef} className={styles.topBar}>
          <h1>Catalog</h1>
          <div className={theme.field}>
            <label>Filter</label>
            <input
              type="text"
              value={filter}
              placeholder="section name..."
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      <div className={theme.mt4}>
        {pageItems.map(item => {
          return (
            <div className={styles.titlesRow} key={item.row_id}>
              <div className={theme.container}>
                <h3>{item.row_name}</h3>
              </div>
              <div className={styles.reel}>
                <div className={styles.trackWrapper}>
                  <div
                    className={styles.track}
                    style={{ margin: `0 ${computedMargin}px` }}
                  >
                    {item.data.map(item => (
                      <Poster
                        key={item.id}
                        selected={item.id === selected}
                        title={item}
                        handleSelect={setSelected}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className={theme.container}>
          <div className={styles.paginationBar}>
            <button onClick={() => setPage(p => (p <= 2 ? 1 : p - 1))}>
              Prev
            </button>
            <div>
              Page{" "}
              <input
                type="number"
                value={page}
                style={{ width: "3rem" }}
                min={1}
                max={pages}
                onChange={e => setPage(e.target.value)}
              />{" "}
              of {pages}
            </div>
            <button onClick={() => setPage(p => (p < pages ? p + 1 : pages))}>
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Poster({ selected, title, handleSelect }) {
  return (
    <div
      className={selected ? styles.posterActive : undefined}
      onMouseOver={() => handleSelect(title.id)}
    >
      <Link to={`/details/${title.id}`}>
        <div className={styles.imageWrapper}>
          <img
            loading="lazy"
            src={title.images.find(item2 => item2.type === "POSTER").url}
          />
        </div>
      </Link>
      <div className={styles.posterLabel}>
        <Link to={`/details/${title.id}`}>{title.title}</Link>
      </div>
    </div>
  );
}

export default Catalog;
