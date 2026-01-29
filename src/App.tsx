import { useEffect } from "react";
import { fetchArtworks } from "./api/artworks";
import ArtworksTable from "./components/ArtsworksTable";
import "./App.css";

function App() {
  useEffect(() => {
    fetchArtworks(1, 5).then(({ rows, totalRecords }) => {
      console.log(rows.length, totalRecords);
    });
  }, []);

  return (
    <div>
      <ArtworksTable />
    </div>
  );
}

export default App;
