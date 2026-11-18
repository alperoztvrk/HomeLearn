import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Library,
  ExternalLink,
  Filter,
  FolderPlus,
  Grid2X2,
  LayoutList,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import "./styles.css";

const resources = [
  {
    id: "maths-steps",
    title: "Multiplication steps",
    short: "Multiplication steps",
    subject: "Mathematics",
    yearGroup: "Year 3",
    duration: "20 min",
    publisher: "Oak Learning",
    format: "Activity",
    reviewDate: "12 Nov 2026",
    reviewCriteria: "Source, age fit, curriculum",
    source: "oaklearning.org/multiplication",
    sourceUrl: "https://example.com/oak-learning",
    verified: true,
    accent: "blue",
    description:
      "A guided activity for building confidence with 3, 4 and 8 times tables.",
  },
  {
    id: "number-lab",
    title: "Number Lab: Times tables",
    short: "Number Lab",
    subject: "Mathematics",
    yearGroup: "Year 4",
    duration: "30 min",
    publisher: "Study Hub",
    format: "Lesson",
    reviewDate: "08 Nov 2026",
    reviewCriteria: "Source, age fit, curriculum",
    source: "studyhub.edu/number-lab",
    sourceUrl: "https://example.com/study-hub",
    verified: true,
    accent: "amber",
    description:
      "A short lesson sequence with examples, practice questions and a quick check.",
  },
  {
    id: "reading-club",
    title: "Reading club: inference",
    short: "Reading club",
    subject: "English",
    yearGroup: "Year 3",
    duration: "15 min",
    publisher: "Read Well",
    format: "Guide",
    reviewDate: "05 Nov 2026",
    reviewCriteria: "Source, age fit, curriculum",
    source: "readwell.co.uk/inference",
    sourceUrl: "https://example.com/read-well",
    verified: false,
    accent: "violet",
    description:
      "A parent-friendly reading prompt set to practise inference through conversation.",
  },
  {
    id: "fraction-kitchen",
    title: "Fractions in the kitchen",
    short: "Fractions in the kitchen",
    subject: "Mathematics",
    yearGroup: "Year 4",
    duration: "25 min",
    publisher: "Bright Path",
    format: "Activity",
    reviewDate: "02 Nov 2026",
    reviewCriteria: "Source, age fit, curriculum",
    source: "brightpath.uk/fractions",
    sourceUrl: "https://example.com/bright-path",
    verified: true,
    accent: "green",
    description:
      "A practical recipe-based activity that introduces halves, quarters and equivalents.",
  },
  {
    id: "phonics-builder",
    title: "Phonics sound builder",
    short: "Phonics sound builder",
    subject: "English",
    yearGroup: "Year 1",
    duration: "10 min",
    publisher: "Little Learners",
    format: "Game",
    reviewDate: "30 Oct 2026",
    reviewCriteria: "Source, age fit, curriculum",
    source: "littlelearners.org/phonics",
    sourceUrl: "https://example.com/little-learners",
    verified: false,
    accent: "rose",
    description:
      "A focused sound-matching game designed for short, repeatable practice sessions.",
  },
  {
    id: "science-senses",
    title: "The five senses",
    short: "The five senses",
    subject: "Science",
    yearGroup: "Year 2",
    duration: "20 min",
    publisher: "Curious Minds",
    format: "Lesson",
    reviewDate: "27 Oct 2026",
    reviewCriteria: "Source, age fit, curriculum",
    source: "curiousminds.org/senses",
    sourceUrl: "https://example.com/curious-minds",
    verified: true,
    accent: "teal",
    description:
      "A simple observation lesson with a printable checklist for home learning.",
  },
];

const defaultCollections = [
  {
    id: "gcse-maths",
    name: "Maths foundations",
    resourceIds: ["maths-steps", "number-lab"],
    updatedAt: "Updated today",
  },
];

const fieldRows = [
  ["Year group", "yearGroup"],
  ["Subject", "subject"],
  ["Duration", "duration"],
  ["Publisher", "publisher"],
  ["Format", "format"],
  ["Source link", "source"],
  ["Review date", "reviewDate"],
  ["Review criteria", "reviewCriteria"],
  ["Trust status", "verified"],
];

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getInitialRoute() {
  const path = window.location.pathname;
  return path === "/collections" ? "collections" : "compare";
}

function App() {
  const [page, setPage] = useState(getInitialRoute);
  const [selectedIds, setSelectedIds] = useState([]);
  const [collections, setCollections] = useState(() =>
    readStorage("homelearning-collections", defaultCollections)
  );
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [stage, setStage] = useState("All stages");
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [pendingCollectionResourceIds, setPendingCollectionResourceIds] =
    useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(
      "homelearning-collections",
      JSON.stringify(collections)
    );
  }, [collections]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    window.history.replaceState(
      {},
      "",
      page === "collections" ? "/collections" : "/compare"
    );
  }, [page]);

  useEffect(() => {
    let frame = null;
    const updateProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        progress.toFixed(3)
      );
      frame = null;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    document
      .querySelectorAll(".reveal-on-scroll")
      .forEach((element) => revealObserver.observe(element));
    return () => revealObserver.disconnect();
  }, [page]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target.closest(
        ".primary-button, .secondary-button, .select-button, .text-button, .collection-card, .nav-item, .collection-option, .new-collection-option, .remove-button"
      );
      if (!target || target.hasAttribute("disabled")) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      const size = Math.max(rect.width, rect.height) * 1.25;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      target.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 560);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        [
          resource.title,
          resource.subject,
          resource.publisher,
          resource.format,
        ].some((value) => value.toLowerCase().includes(query));
      const matchesSubject =
        subject === "All subjects" || resource.subject === subject;
      const matchesStage =
        stage === "All stages" || resource.yearGroup === stage;
      return matchesSearch && matchesSubject && matchesStage;
    });
  }, [search, subject, stage]);

  const selectedResources = selectedIds
    .map((id) => resources.find((resource) => resource.id === id))
    .filter(Boolean);
  const allSavedIds = collections.flatMap(
    (collection) => collection.resourceIds
  );
  const subjects = [
    "All subjects",
    ...new Set(resources.map((resource) => resource.subject)),
  ];
  const stages = [
    "All stages",
    ...new Set(resources.map((resource) => resource.yearGroup)),
  ];

  const navigate = (nextPage) => {
    setPage(nextPage);
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSelection = (resourceId) => {
    setSelectedIds((current) => {
      if (current.includes(resourceId))
        return current.filter((id) => id !== resourceId);
      if (current.length >= 3) {
        setToast({
          type: "limit",
          message: "You can compare up to three resources at a time.",
        });
        return current;
      }
      return [...current, resourceId];
    });
  };

  const showToast = (message, type = "success") => setToast({ message, type });

  const openCreateCollection = (resourceIds = []) => {
    setPendingCollectionResourceIds(resourceIds);
    setShowCreateCollection(true);
  };

  const createCollection = (name, resourceIds = []) => {
    const cleanName = name.trim();
    if (!cleanName) return false;
    const newCollection = {
      id: `${Date.now()}`,
      name: cleanName,
      resourceIds: [...new Set(resourceIds)],
      updatedAt: "Updated just now",
    };
    setCollections((current) => [...current, newCollection]);
    setActiveCollectionId(newCollection.id);
    setShowCreateCollection(false);
    showToast(
      newCollection.resourceIds.length
        ? `${newCollection.resourceIds.length} resources saved to “${cleanName}”.`
        : `Collection “${cleanName}” created.`
    );
    setPendingCollectionResourceIds([]);
    return true;
  };

  const addToCollection = (collectionId, resourceIds) => {
    const ids = [...new Set(resourceIds)];
    const target = collections.find(
      (collection) => collection.id === collectionId
    );
    if (!target) return;
    const additions = ids.filter((id) => !target.resourceIds.includes(id));
    setCollections((current) =>
      current.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              resourceIds: [...collection.resourceIds, ...additions],
              updatedAt: "Updated just now",
            }
          : collection
      )
    );
    if (additions.length) {
      showToast(
        `${
          additions.length === 1 ? "Resource" : `${additions.length} resources`
        } saved to “${target.name}”.`
      );
    } else {
      showToast("Those resources are already in this collection.", "info");
    }
  };

  const removeFromCollection = (collectionId, resourceId) => {
    setCollections((current) =>
      current.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              resourceIds: collection.resourceIds.filter(
                (id) => id !== resourceId
              ),
              updatedAt: "Updated just now",
            }
          : collection
      )
    );
    showToast("Resource removed from the collection.", "info");
  };

  const deleteCollection = (collectionId) => {
    const target = collections.find(
      (collection) => collection.id === collectionId
    );
    if (!target) return;
    setCollections((current) =>
      current.filter((collection) => collection.id !== collectionId)
    );
    setActiveCollectionId(null);
    showToast(`“${target.name}” deleted.`, "info");
  };

  return (
    <div className="app-shell">
      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="main-shell">
        <Header page={page} navigate={navigate} />
        <main id="main-content" className="main-content">
          <div className="content-wrap">
            {page === "compare" ? (
              <ComparePage
                resources={filteredResources}
                selectedIds={selectedIds}
                selectedResources={selectedResources}
                allSavedIds={allSavedIds}
                collections={collections}
                search={search}
                setSearch={setSearch}
                subject={subject}
                setSubject={setSubject}
                stage={stage}
                setStage={setStage}
                subjects={subjects}
                stages={stages}
                toggleSelection={toggleSelection}
                navigate={navigate}
                addToCollection={addToCollection}
                showCreateCollection={openCreateCollection}
                clearSelection={() => setSelectedIds([])}
                toast={toast}
              />
            ) : (
              <CollectionsPage
                collections={collections}
                resources={resources}
                activeCollectionId={activeCollectionId}
                setActiveCollectionId={setActiveCollectionId}
                showCreateCollection={() => openCreateCollection()}
                createCollection={createCollection}
                deleteCollection={deleteCollection}
                removeFromCollection={removeFromCollection}
                navigate={navigate}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
      {showCreateCollection && (
        <CreateCollectionDialog
          onClose={() => {
            setShowCreateCollection(false);
            setPendingCollectionResourceIds([]);
          }}
          onCreate={(name) =>
            createCollection(name, pendingCollectionResourceIds)
          }
        />
      )}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function Sidebar({ page, navigate, collections, isOpen, onToggle }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <button
        className="brand-lockup brand-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Collapse" : "Expand"} HomeLearning navigation`}
      >
        <div className="brand-mark" aria-hidden="true">
          <span>H</span>
          <span>L</span>
        </div>
        <div>
          <div className="brand-name">HomeLearning</div>
          <div className="brand-subtitle">Resource guide</div>
        </div>
        <span
          className={`menu-glyph ${isOpen ? "is-open" : ""}`}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className="sidebar-rule" />
      <div className="nav-label">Workspace</div>
      <nav className="primary-nav">
        <button
          className={`nav-item ${page === "compare" ? "active" : ""}`}
          onClick={() => navigate("compare")}
          aria-current={page === "compare" ? "page" : undefined}
        >
          <span className="nav-icon">
            <LayoutList size={17} strokeWidth={1.8} />
          </span>
          <span>Compare</span>
          {page === "compare" && (
            <span className="nav-active-dot" aria-hidden="true" />
          )}
        </button>
        <button
          className={`nav-item ${page === "collections" ? "active" : ""}`}
          onClick={() => navigate("collections")}
          aria-current={page === "collections" ? "page" : undefined}
        >
          <span className="nav-icon">
            <Library size={17} strokeWidth={1.8} />
          </span>
          <span>Collections</span>
          {collections.length > 0 && (
            <span className="nav-count">{collections.length}</span>
          )}
        </button>
      </nav>
    </aside>
  );
}

function MobileMenu({ page, navigate }) {
  return (
    <div className="mobile-menu" aria-label="Mobile navigation">
      <button
        className={page === "compare" ? "active" : ""}
        onClick={() => navigate("compare")}
      >
        <LayoutList size={17} /> Compare
      </button>
      <button
        className={page === "collections" ? "active" : ""}
        onClick={() => navigate("collections")}
      >
        <Library size={17} /> Collections
      </button>
    </div>
  );
}

function Header({ page, navigate }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark" aria-hidden="true">
          <span>H</span>
          <span>L</span>
        </div>
        <div className="brand-name">HomeLearning</div>
      </div>

      <nav className="top-tabs" aria-label="Primary navigation">
        <button
          className={`top-tab ${page === "compare" ? "active" : ""}`}
          onClick={() => navigate("compare")}
          aria-current={page === "compare" ? "page" : undefined}
        >
          <LayoutList size={16} /> Compare
        </button>
        <button
          className={`top-tab ${page === "collections" ? "active" : ""}`}
          onClick={() => navigate("collections")}
          aria-current={page === "collections" ? "page" : undefined}
        >
          <Library size={16} /> Collections
        </button>
      </nav>

      <div aria-hidden="true" />
    </header>
  );
}

function ComparePage({
  resources: filteredResources,
  selectedIds,
  selectedResources,
  allSavedIds,
  collections,
  search,
  setSearch,
  subject,
  setSubject,
  stage,
  setStage,
  subjects,
  stages,
  toggleSelection,
  navigate,
  addToCollection,
  showCreateCollection,
  clearSelection,
}) {
  const [viewMode, setViewMode] = useState("grid");
  return (
    <div className="page-view page-enter">
      <section className="page-intro compare-intro">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> Decision workspace
          </div>
          <h1>
            Compare resources<span className="heading-period">.</span>
          </h1>
          <p className="lede">
            Put trustworthy learning resources side by side, then choose what
            feels right for your child.
          </p>
        </div>
        <div className="intro-stat">
          <span className="stat-number">
            {String(selectedIds.length).padStart(2, "0")}
            <em>/03</em>
          </span>
          <span className="stat-label">resources selected</span>
        </div>
      </section>

      <section className="compare-toolbar" aria-label="Resource filters">
        <div className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources"
            aria-label="Search resources"
          />
          {search && (
            <button
              className="field-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="select-field">
          <Filter size={15} />
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            aria-label="Filter by subject"
          >
            {subjects.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
        <div className="select-field">
          <SlidersHorizontal size={15} />
          <select
            value={stage}
            onChange={(event) => setStage(event.target.value)}
            aria-label="Filter by key stage"
          >
            {stages.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
        <div className="toolbar-spacer" />
        <span className="result-count">
          {filteredResources.length} resources
        </span>
      </section>

      <section
        className="resource-section reveal-on-scroll"
        aria-labelledby="resource-list-title"
      >
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">01 / Explore</span>
            <h2 id="resource-list-title">Find a starting point</h2>
          </div>
          <div className="view-switcher" aria-label="View options">
            <button
              className={viewMode === "grid" ? "selected" : ""}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <Grid2X2 size={16} />
            </button>
            <button
              className={viewMode === "list" ? "selected" : ""}
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <LayoutList size={16} />
            </button>
          </div>
        </div>
        {filteredResources.length === 0 ? (
          <SearchEmpty
            onReset={() => {
              setSearch("");
              setSubject("All subjects");
              setStage("All stages");
            }}
          />
        ) : (
          <div
            className={`resource-grid ${
              viewMode === "list" ? "list-view" : ""
            }`}
          >
            {filteredResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                index={index}
                selected={selectedIds.includes(resource.id)}
                saved={allSavedIds.includes(resource.id)}
                onToggle={() => toggleSelection(resource.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section
        className="comparison-section reveal-on-scroll"
        aria-labelledby="comparison-title"
      >
        <div className="section-heading-row comparison-heading">
          <div>
            <span className="section-kicker">02 / Compare</span>
            <h2 id="comparison-title">A clearer view</h2>
          </div>
          {selectedIds.length > 0 && (
            <button className="text-button" onClick={clearSelection}>
              Clear selection <X size={14} />
            </button>
          )}
        </div>
        {selectedResources.length === 0 ? (
          <CompareEmpty navigate={navigate} />
        ) : selectedResources.length === 1 ? (
          <OneSelectedState
            resource={selectedResources[0]}
            onAdd={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        ) : (
          <ComparisonTable
            selectedResources={selectedResources}
            collections={collections}
            addToCollection={addToCollection}
            showCreateCollection={showCreateCollection}
          />
        )}
      </section>
    </div>
  );
}

function ResourceCard({
  resource,
  index,
  selected,
  saved,
  onToggle,
  variant = "compare",
  onRemove,
}) {
  return (
    <article
      className={`resource-card ${variant === "saved" ? "saved-card" : ""} ${
        selected ? "is-selected" : ""
      }`}
      style={{ "--card-delay": `${index * 55}ms` }}
    >
      <div className={`card-art art-${resource.accent}`} aria-hidden="true">
        <span className="art-orbit orbit-one" />
        <span className="art-orbit orbit-two" />
        <span className="art-shape">
          {resource.subject === "Mathematics"
            ? "×"
            : resource.subject === "English"
            ? "Aa"
            : "◌"}
        </span>
        <span className="art-index">0{index + 1}</span>
      </div>
      <div className="card-body">
        <div className="card-topline">
          <span className="format-label">{resource.format}</span>
          {resource.verified ? (
            <span className="verified-label">
              <Check size={12} /> Reviewed
            </span>
          ) : (
            <span className="unreviewed-label">Not reviewed</span>
          )}
        </div>
        <h3>{resource.title}</h3>
        <p className="card-description">{resource.description}</p>
        <div className="card-meta">
          <span>{resource.yearGroup}</span>
          <span className="meta-divider" />
          <span>{resource.duration}</span>
          <span className="meta-divider" />
          <span>{resource.subject}</span>
        </div>
        <div className="card-footer">
          <span className="publisher">{resource.publisher}</span>
          {variant === "saved" ? (
            <button className="remove-button" onClick={onRemove}>
              <Trash2 size={14} /> Remove
            </button>
          ) : (
            <button
              className={`select-button ${selected ? "selected" : ""}`}
              onClick={onToggle}
              aria-pressed={selected}
            >
              {selected ? (
                <>
                  <Check size={15} /> Selected
                </>
              ) : (
                <>
                  <Plus size={15} /> Compare
                </>
              )}
            </button>
          )}
        </div>
      </div>
      {saved && (
        <div className="saved-ribbon">
          <Bookmark size={12} fill="currentColor" /> Saved
        </div>
      )}
    </article>
  );
}

function SearchEmpty({ onReset }) {
  return (
    <div className="empty-panel compact-empty">
      <div className="empty-icon">
        <Search size={21} />
      </div>
      <h3>No resources match those filters.</h3>
      <p>Try another subject, stage or search term.</p>
      <button className="secondary-button" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}

function CompareEmpty({ navigate }) {
  return (
    <div className="empty-panel compare-empty">
      <div className="empty-graphic" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div>
        <span className="empty-kicker">Ready when you are</span>
        <h3>Select two or three resources to compare.</h3>
        <p>
          Start with the cards above. We’ll line up the details that matter,
          without opening each resource one by one.
        </p>
        <button
          className="secondary-button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Browse resources <ArrowRight size={15} />
        </button>
      </div>
      <div className="empty-side-note">
        <span>Tip</span>
        <p>
          Look for the <strong>Reviewed</strong> label when trust matters most.
        </p>
      </div>
    </div>
  );
}

function OneSelectedState({ resource, onAdd }) {
  return (
    <div className="one-selected-panel">
      <div className="selected-number">01</div>
      <div>
        <span className="empty-kicker">One resource selected</span>
        <h3>Choose one more to start comparing.</h3>
        <p>
          <strong>{resource.title}</strong> is ready. Add another resource above
          and the comparison table will appear here.
        </p>
      </div>
      <button className="secondary-button" onClick={onAdd}>
        Choose another <ArrowRight size={15} />
      </button>
    </div>
  );
}

function ComparisonTable({
  selectedResources,
  collections,
  addToCollection,
  showCreateCollection,
}) {
  const [collectionId, setCollectionId] = useState(collections[0]?.id || "");
  const [openSave, setOpenSave] = useState(false);
  const differingRows = fieldRows
    .filter(
      ([, key]) =>
        new Set(selectedResources.map((resource) => resource[key])).size > 1
    )
    .map(([, key]) => key);

  useEffect(() => {
    if (!collections.some((collection) => collection.id === collectionId))
      setCollectionId(collections[0]?.id || "");
  }, [collections, collectionId]);

  const handleSave = () => {
    if (!collectionId) {
      setOpenSave(false);
      showCreateCollection(selectedResources.map((resource) => resource.id));
      return;
    }
    addToCollection(
      collectionId,
      selectedResources.map((resource) => resource.id)
    );
    setOpenSave(false);
  };

  return (
    <div className="comparison-wrap">
      <div className="comparison-toolbar-top">
        <div>
          <span className="comparison-summary">
            <span className="summary-dot" /> {selectedResources.length}{" "}
            resources in view
          </span>
          <span className="difference-summary">
            {differingRows.length}{" "}
            {differingRows.length === 1 ? "difference" : "differences"}{" "}
            highlighted
          </span>
        </div>
        <div className="save-control">
          <button
            className="primary-button"
            onClick={() => setOpenSave((value) => !value)}
          >
            <Bookmark size={15} /> Save to collection <ChevronDown size={14} />
          </button>
          {openSave && (
            <div className="save-popover">
              <div className="popover-title">Save selected resources</div>
              {collections.length ? (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    className="collection-option"
                    onClick={() => {
                      setCollectionId(collection.id);
                      addToCollection(
                        collection.id,
                        selectedResources.map((resource) => resource.id)
                      );
                      setOpenSave(false);
                    }}
                  >
                    <span className="collection-option-icon">
                      <Library size={14} />
                    </span>
                    <span>
                      <strong>{collection.name}</strong>
                      <small>{collection.resourceIds.length} resources</small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))
              ) : (
                <p className="popover-empty">Create a collection first.</p>
              )}
              <button
                className="new-collection-option"
                onClick={() => {
                  setOpenSave(false);
                  showCreateCollection(
                    selectedResources.map((resource) => resource.id)
                  );
                }}
              >
                <Plus size={14} /> New collection
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="table-scroll"
        tabIndex="0"
        aria-label="Scrollable resource comparison"
      >
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col" className="detail-column">
                Detail
              </th>
              {selectedResources.map((resource, index) => (
                <th scope="col" key={resource.id}>
                  <div className="table-resource-heading">
                    <span
                      className={`table-resource-marker marker-${resource.accent}`}
                    />{" "}
                    <span>0{index + 1}</span>
                    <strong>{resource.short}</strong>
                    <small>{resource.publisher}</small>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fieldRows.map(([label, key]) => {
              const differs = differingRows.includes(key);
              return (
                <tr className={differs ? "differs" : ""} key={key}>
                  <th scope="row">
                    <span className="row-label">{label}</span>
                    {differs && <span className="diff-tag">Differs</span>}
                  </th>
                  {selectedResources.map((resource) => (
                    <td key={`${resource.id}-${key}`}>
                      {key === "source" ? (
                        <a
                          href={resource.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {resource.source} <ExternalLink size={12} />
                        </a>
                      ) : key === "verified" ? (
                        <span>
                          {resource.verified ? (
                            <span className="table-status verified">
                              <Check size={12} /> Reviewed
                            </span>
                          ) : (
                            <span className="table-status">Not reviewed</span>
                          )}
                        </span>
                      ) : (
                        resource[key]
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="comparison-footnote">
        <CircleHelp size={14} />
        <span>
          Reviewed means our sample resource met the current source, age-fit and
          curriculum checks. It is not a certificate.
        </span>
      </div>
    </div>
  );
}

function CollectionsPage({
  collections,
  resources,
  activeCollectionId,
  setActiveCollectionId,
  showCreateCollection,
  deleteCollection,
  removeFromCollection,
  navigate,
}) {
  const activeCollection =
    collections.find((collection) => collection.id === activeCollectionId) ||
    collections[0];
  const activeResources = activeCollection
    ? activeCollection.resourceIds
        .map((id) => resources.find((resource) => resource.id === id))
        .filter(Boolean)
    : [];

  return (
    <div className="page-view page-enter collections-view">
      <section className="page-intro collections-intro">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> Personal library
          </div>
          <h1>
            Collections<span className="heading-period">.</span>
          </h1>
          <p className="lede">
            Keep useful resources close, organised by what your child needs
            next.
          </p>
        </div>
        <button
          className="primary-button intro-action"
          onClick={showCreateCollection}
        >
          <FolderPlus size={16} /> New collection
        </button>
      </section>
      {collections.length === 0 ? (
        <CollectionsEmpty
          showCreateCollection={showCreateCollection}
          navigate={navigate}
        />
      ) : (
        <>
          <section className="collections-overview reveal-on-scroll">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">01 / Your lists</span>
                <h2>Saved for later</h2>
              </div>
              <span className="result-count">
                {collections.length}{" "}
                {collections.length === 1 ? "collection" : "collections"}
              </span>
            </div>
            <div className="collection-grid">
              {collections.map((collection, index) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  active={collection.id === activeCollection?.id}
                  index={index}
                  onClick={() => setActiveCollectionId(collection.id)}
                />
              ))}
            </div>
          </section>
          <section className="collection-detail-section reveal-on-scroll">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">02 / Open collection</span>
                <h2>{activeCollection?.name}</h2>
              </div>
              {activeCollection && (
                <div className="detail-actions">
                  <span className="result-count">
                    {activeResources.length}{" "}
                    {activeResources.length === 1 ? "resource" : "resources"}
                  </span>
                  <button
                    className="icon-button danger-hover"
                    onClick={() => deleteCollection(activeCollection.id)}
                    aria-label={`Delete ${activeCollection.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            {activeResources.length === 0 ? (
              <CollectionEmpty navigate={navigate} />
            ) : (
              <div className="saved-resource-grid">
                {activeResources.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    index={index}
                    variant="saved"
                    saved
                    onRemove={() =>
                      removeFromCollection(activeCollection.id, resource.id)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function CollectionCard({ collection, active, index, onClick }) {
  return (
    <button
      className={`collection-card ${active ? "active" : ""}`}
      onClick={onClick}
      style={{ "--card-delay": `${index * 70}ms` }}
    >
      <div className="collection-card-top">
        <span className="collection-icon">
          <Library size={18} />
        </span>
        <MoreHorizontal size={17} />
      </div>
      <div className="collection-card-bottom">
        <strong>{collection.name}</strong>
        <span>
          {collection.resourceIds.length}{" "}
          {collection.resourceIds.length === 1 ? "resource" : "resources"}{" "}
          <span className="bullet">·</span>{" "}
          {collection.updatedAt.replace("Updated ", "")}
        </span>
      </div>
      <span className="collection-arrow">
        <ArrowRight size={15} />
      </span>
    </button>
  );
}

function CollectionsEmpty({ showCreateCollection, navigate }) {
  return (
    <div className="collections-empty">
      <div className="empty-graphic stack-graphic" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div>
        <span className="empty-kicker">A quiet space to start</span>
        <h3>Build your first collection.</h3>
        <p>
          Save resources for revision, reading, maths or any other learning
          goal. Your lists stay on this device in this prototype.
        </p>
        <div className="empty-actions">
          <button className="primary-button" onClick={showCreateCollection}>
            <FolderPlus size={15} /> Create collection
          </button>
          <button className="text-button" onClick={() => navigate("compare")}>
            Browse compare <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectionEmpty({ navigate }) {
  return (
    <div className="empty-panel collection-empty">
      <div className="empty-icon">
        <Bookmark size={21} />
      </div>
      <div>
        <span className="empty-kicker">Nothing saved here yet</span>
        <h3>Give this collection a useful first resource.</h3>
        <p>Compare a few resources, then save the ones you want to revisit.</p>
        <button
          className="secondary-button"
          onClick={() => navigate("compare")}
        >
          Go to Compare <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function CreateCollectionDialog({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (!onCreate(name)) setError("Give your collection a short name first.");
  };
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-top">
          <div>
            <span className="section-kicker">New list</span>
            <h2 id="dialog-title">Create a collection</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <p className="dialog-copy">
          Give your saved resources a name that makes sense for the next
          learning moment.
        </p>
        <form onSubmit={submit}>
          <label htmlFor="collection-name">Collection name</label>
          <input
            id="collection-name"
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Year 3 maths"
            aria-invalid={Boolean(error)}
          />
          {error && <span className="form-error">{error}</span>}
          <div className="dialog-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              <Plus size={15} /> Create collection
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const icon =
    toast.type === "limit" ? (
      <CircleHelp size={17} />
    ) : toast.type === "info" ? (
      <Bookmark size={17} />
    ) : (
      <Check size={17} />
    );
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span className="toast-icon">{icon}</span>
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Dismiss message">
        <X size={14} />
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>
        HomeLearning <span className="footer-dot">·</span> Sprint 1 front-end
      </span>
      <span className="footer-right">
        <span className="footer-check" /> Accessible by design
      </span>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
