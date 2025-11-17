// src/App.tsx
import React, { FC, useMemo, useState } from "react";
import "./style.css";

import { useInventoryData } from "./hooks/useInventoryData";
import { AgingBuckets, DrillType, Filters, InventoryRow } from "./types";

import { HeaderBar } from "./components/HeaderBar";
import { FiltersBar } from "./components/FiltersBar";
import { KpiBar } from "./components/KpiBar";
import { ChartsSection } from "./components/ChartsSection";
import { InventoryHealthPanel } from "./components/InventoryHealthPanel";
import { NewArrivalsPanel } from "./components/NewArrivalsPanel";
import { InventoryTable } from "./components/InventoryTable";
import { DrilldownTable } from "./components/DrilldownTable";
import { VehicleDetailDrawer } from "./components/VehicleDetailDrawer";

const STOP_WORDS = new Set([
    "i","im","i'm","looking","for","to","the","a","an",
    "with","show","me","find","need","want","please"
]);

const App: FC = () => {
    const { rows, error, sortedRows, modelPieData } = useInventoryData();

    // ----------------- STATE -----------------
    const [searchTerm, setSearchTerm] = useState("");
    const [smartQuery, setSmartQuery] = useState("");

    const [filters, setFilters] = useState<Filters>({
        model: "",
        year: "ALL",
        priceMin: "",
        priceMax: ""
    });

    const [drillType, setDrillType] = useState<DrillType>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<InventoryRow | null>(null);

    // ----------------- MICROPHONE -----------------
    const handleVoiceSearch = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Voice search not supported on this device.");
            return;
        }

        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
            const text = event.results[0][0].transcript.trim();
            setSmartQuery(text);
            setSearchTerm(text);
        };

        recog.onerror = (e: any) => console.error("Speech error:", e);
        recog.start();
    };

    // ----------------- FILTERED LIST -----------------
    const filteredRows = useMemo(() => {
        let data = [...sortedRows];

        if (filters.model) {
            data = data.filter((r) => r.Model === filters.model);
        }

        if (filters.year !== "ALL") {
            const yr = Number(filters.year);
            data = data.filter((r) => r.Year === yr);
        }

        if (filters.priceMin) {
            data = data.filter((r) => r.MSRP >= Number(filters.priceMin));
        }

        if (filters.priceMax) {
            data = data.filter((r) => r.MSRP <= Number(filters.priceMax));
        }

        if (searchTerm.trim() !== "") {
            const rawTokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
            const tokens = rawTokens.filter((t) => !STOP_WORDS.has(t));

            data = data.filter((r) => {
                const haystack = [
                    r["Stock Number"],
                    r["Short VIN"],
                    r.Make,
                    r.Model,
                    r["Model Number"],
                    r["Exterior Color"],
                    r.Trim,
                    String(r.Year),
                ]
                    .join(" ")
                    .toLowerCase();

                return tokens.every((token) => haystack.includes(token));
            });
        }

        return data;
    }, [sortedRows, filters, searchTerm]);

    // ----------------- NEW ARRIVALS -----------------
    const newArrivalRows = useMemo(
        () => rows.filter((r) => r.Age <= 7).sort((a, b) => a.Model.localeCompare(b.Model)),
        [rows]
    );

    // ----------------- AGING BUCKETS -----------------
    const agingBuckets: AgingBuckets = useMemo(() => {
        const b = { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 };
        rows.forEach((r) => {
            if (r.Age <= 30) b.bucket0_30++;
            else if (r.Age <= 60) b.bucket31_60++;
            else if (r.Age <= 90) b.bucket61_90++;
            else b.bucket90_plus++;
        });
        return b;
    }, [rows]);

    // ----------------- DRILLDOWN -----------------
    const buildGroups = (items: InventoryRow[]) => {
        const groups: Record<string, InventoryRow[]> = {};
        items.forEach((r) => {
            const key = `${r.Make}|${r.Model}|${r["Model Number"]}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
        });

        Object.values(groups).forEach((g) =>
            g.sort((a, b) => b.Age - a.Age)
        );

        return groups;
    };

    const drillData = useMemo(() => {
        if (!drillType) return null;

        let result: InventoryRow[] = [];

        if (drillType === "total") result = [...sortedRows];
        if (drillType === "new") result = [...newArrivalRows];
        if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30);
        if (drillType === "31_60") result = rows.filter((r) => r.Age > 30 && r.Age <= 60);
        if (drillType === "61_90") result = rows.filter((r) => r.Age > 60 && r.Age <= 90);
        if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90);

        result.sort((a, b) => a.Model.localeCompare(b.Model));
        return buildGroups(result);
    }, [drillType, rows, sortedRows, newArrivalRows]);

    const resetAll = () => {
        setDrillType(null);
        setSearchTerm("");
        setSmartQuery("");
        setFilters({ model: "", year: "ALL", priceMin: "", priceMax: "" });
    };

    const handleRowClick = (row: InventoryRow) => setSelectedVehicle(row);

    // ----------------- UI -----------------
    return (
        <div className="app-root">
            <HeaderBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <main className="app-main">
                {/* Microphone button outside search bar */}
                <button
                    className="mic-float-btn"
                    onClick={handleVoiceSearch}
                    aria-label="Voice Search"
                >
                    🎤
                </button>

                {error && (
                    <section className="panel error-panel">
                        <div className="section-title">File Error</div>
                        <p>{error}</p>
                    </section>
                )}

                {rows.length > 0 && (
                    <>
                        <FiltersBar
                            models={Array.from(new Set(rows.map((r) => r.Model))).sort()}
                            filters={filters}
                            onChange={setFilters}
                            onSearchClick={() => setSearchTerm(smartQuery)}
                        />

                        <KpiBar
                            totalUnits={rows.length}
                            newArrivalCount={newArrivalRows.length}
                            onSelectTotalUnits={resetAll}
                            onSelectNewArrivals={() => setDrillType("new")}
                        />

                        <ChartsSection
                            modelPieData={modelPieData}
                            agingBuckets={agingBuckets}
                            agingHandlers={{
                                on0_30: () => setDrillType("0_30"),
                                on31_60: () => setDrillType("31_60"),
                                on61_90: () => setDrillType("61_90"),
                                on90_plus: () => setDrillType("90_plus"),
                            }}
                        />

                        <InventoryHealthPanel rows={rows} agingBuckets={agingBuckets} />

                        {!drillType && <NewArrivalsPanel rows={newArrivalRows} />}

                        {drillType ? (
                            drillData && (
                                <DrilldownTable
                                    groups={drillData}
                                    onBack={resetAll}
                                    onRowClick={handleRowClick}
                                />
                            )
                        ) : (
                            <InventoryTable rows={filteredRows} onRowClick={handleRowClick} />
                        )}

                        <VehicleDetailDrawer
                            vehicle={selectedVehicle}
                            onClose={() => setSelectedVehicle(null)}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default App;
