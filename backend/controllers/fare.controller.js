const fs = require('fs');
const path = require('path');

let cachedData = {
  fares: [],
  regions: [],
  updatedAt: null,
  fileSignature: null
};

const csvFilePath = path.resolve(__dirname, '..', '..', 'bus_fares.csv');

const parseCSV = (raw) => {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  // Remove header row
  lines.shift();

  return lines
    .map((line, index) => {
      const parts = line.split(',');
      if (parts.length < 3) {
        return null;
      }

      const [regionRaw, placeRaw, amountRaw] = parts;
      const amount = Number(amountRaw);

      if (!regionRaw || !placeRaw || Number.isNaN(amount)) {
        return null;
      }

      return {
        id: index,
        region: regionRaw.trim(),
        place: placeRaw.trim(),
        amount
      };
    })
    .filter(Boolean);
};

const loadFaresFromFile = () => {
  try {
    const stats = fs.statSync(csvFilePath);
    const fileSignature = `${stats.size}-${stats.mtimeMs}`;

    if (cachedData.fileSignature === fileSignature && cachedData.fares.length) {
      return cachedData;
    }

    const raw = fs.readFileSync(csvFilePath, 'utf8');
    const fares = parseCSV(raw);
    const regions = Array.from(new Set(fares.map((fare) => fare.region))).sort();

    cachedData = {
      fares,
      regions,
      updatedAt: stats.mtime,
      fileSignature
    };

    return cachedData;
  } catch (error) {
    console.error('Failed to load bus fares:', error);
    throw new Error('Unable to load bus fare data');
  }
};

const getFares = (req, res) => {
  try {
    const data = loadFaresFromFile();
    const { region, search } = req.query;

    let filtered = data.fares;

    if (region) {
      filtered = filtered.filter(
        (fare) => fare.region.toLowerCase() === region.toLowerCase()
      );
    }

    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter(
        (fare) =>
          fare.place.toLowerCase().includes(keyword) ||
          fare.region.toLowerCase().includes(keyword)
      );
    }

    return res.json({
      total: filtered.length,
      updatedAt: data.updatedAt,
      regions: data.regions,
      fares: filtered
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRegions = (req, res) => {
  try {
    const data = loadFaresFromFile();
    return res.json({ regions: data.regions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFares,
  getRegions
};


