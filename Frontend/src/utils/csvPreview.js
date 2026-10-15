export const REQUIRED_COLUMNS = ["operator", "category", "price", "validityDays"];
export const PREVIEW_COLUMNS = ["operator", "category", "price", "validityDays", "dailyData", "totalData"];

const OPERATORS = { jio: "Jio", airtel: "Airtel", vi: "VI", bsnl: "BSNL" };

const CATEGORIES = {
  daily: "Daily",
  "non-daily": "Non-Daily",
  "non daily": "Non-Daily",
  nondaily: "Non-Daily",
};

const OTT_ALIASES = {
  hotstar: "JioHotstar",
  jiohotstar: "JioHotstar",
  disneyhotstar: "JioHotstar",
  disney: "JioHotstar",
  prime: "Prime",
  amazonprime: "Prime",
  netflix: "Netflix",
  sonyliv: "SonyLiv",
  sony: "SonyLiv",
  zee5: "Zee5",
  zee: "Zee5",
  other: "Other",
};

const MAX_ROWS = 2000;

// Minimal RFC-4180 style parser: quoted fields, escaped quotes, CRLF or LF.
export const parseCsv = (input) => {
  const src = String(input).replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const pushRow = () => {
    row.push(field);
    field = "";
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      pushRow();
    } else {
      field += ch;
    }
  }
  pushRow();

  if (rows.length === 0) return { headers: [], records: [] };

  const headers = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? "").trim()]))
  );

  return { headers, records };
};

const optionalNumber = (value) => {
  if (value === "") return { value: undefined };
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return { error: true };
  return { value: n > 0 ? n : undefined };
};

const optionalBoolean = (value) => {
  const raw = value.toLowerCase();
  return raw === "" || raw === "true" || raw === "false" ? {} : { error: true };
};

const validateRecord = (record) => {
  const errors = [];
  const warnings = [];

  if (!OPERATORS[(record.operator || "").toLowerCase()])
    errors.push(`operator "${record.operator || ""}" must be one of Jio, Airtel, VI, BSNL`);

  if (!CATEGORIES[(record.category || "").toLowerCase()])
    errors.push(`category "${record.category || ""}" must be Daily or Non-Daily`);

  const price = Number(record.price);
  if (!Number.isFinite(price) || price < 1) errors.push("price must be a number of at least 1");

  const validity = Number(record.validityDays);
  if (!Number.isInteger(validity) || validity < 1 || validity > 365)
    errors.push("validityDays must be a whole number from 1 to 365");

  const daily = optionalNumber(record.dailyData || "");
  if (daily.error) errors.push("dailyData must be a positive number");
  const total = optionalNumber(record.totalData || "");
  if (total.error) errors.push("totalData must be a positive number");
  if (optionalNumber(record.sms || "").error) errors.push("sms must be a positive number");

  for (const key of ["isUnlimitedCalls", "isUnlimitedSMS", "isActive"]) {
    if (optionalBoolean(record[key] || "").error) errors.push(`${key} must be true or false`);
  }

  if (record.ottApps) {
    for (const part of record.ottApps.split(",")) {
      const name = part.trim();
      if (name && !OTT_ALIASES[name.toLowerCase().replace(/[\s+_-]/g, "")])
        errors.push(`unknown OTT app "${name}"`);
    }
  }

  if (!daily.error && !total.error && daily.value === undefined && total.value === undefined)
    errors.push("either dailyData or totalData is required");

  if ((record.category || "").toLowerCase() === "daily" && daily.value === undefined && !daily.error)
    warnings.push("category is Daily but dailyData is empty");

  return { errors, warnings };
};

export const analyzeCsv = (text) => {
  const { headers, records } = parseCsv(text);

  const missingColumns = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
  const tooMany = records.length > MAX_ROWS;
  const seen = new Map();
  const rows = [];
  const issues = [];
  let errorCount = 0;
  let warningCount = 0;

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const { errors, warnings } = missingColumns.length
      ? { errors: [], warnings: [] }
      : validateRecord(record);

    const key = [record.operator, record.price, record.validityDays, record.dailyData, record.totalData]
      .map((v) => String(v ?? "").toLowerCase())
      .join("|");
    if (seen.has(key)) warnings.push(`duplicate of row ${seen.get(key)}`);
    else seen.set(key, rowNumber);

    if (errors.length) errorCount += 1;
    warningCount += warnings.length;
    errors.forEach((text) => issues.push({ rowNumber, type: "error", text }));
    warnings.forEach((text) => issues.push({ rowNumber, type: "warning", text }));

    rows.push({ rowNumber, record, errors, warnings });
  });

  const totalRows = records.length;

  return {
    headers,
    rows,
    issues,
    totalRows,
    errorCount,
    warningCount,
    readyCount: totalRows - errorCount,
    missingColumns,
    tooMany,
    blocking: totalRows === 0 || missingColumns.length > 0 || errorCount > 0 || tooMany,
  };
};