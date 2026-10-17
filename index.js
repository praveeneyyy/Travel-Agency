const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// In-memory data store
const packages = [];
let nextId = 1;

const VALID_CATEGORIES = [
  'beach',
  'hill',
  'heritage',
  'adventure',
  'pilgrimage',
  'Beach',
  'Hill',
  'Heritage',
  'Adventure',
  'Pilgrimage',
];

const REQUIRED_FIELDS = [
  'name',
  'destination',
  'category',
  'pricePerPerson',
  'durationDays',
  'includesFlight',
];

// Validation helper
function validateField(field, value, currentId = null) {
  if (value === undefined || value === null) {
    return `${field} is required`;
  }

  switch (field) {
    case 'name':
      if (typeof value !== 'string') {
        return 'name must be a string';
      }
      if (value.trim().length < 3) {
        return 'name must be at least 3 characters long';
      }
      // Uniqueness check
      const duplicate = packages.some(
        (p) =>
          p.name.toLowerCase() === value.trim().toLowerCase() &&
          p.id !== currentId
      );
      if (duplicate) {
        return 'Package with this name already exists';
      }
      break;

    case 'destination':
      if (typeof value !== 'string' || value.trim().length < 2) {
        return 'destination must be a valid string of at least 2 characters';
      }
      break;

    case 'category':
      if (typeof value !== 'string' || !VALID_CATEGORIES.includes(value)) {
        return 'Invalid category';
      }
      break;

    case 'pricePerPerson':
      if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
        return 'pricePerPerson must be a positive number';
      }
      break;

    case 'durationDays':
      if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        return 'durationDays must be a positive integer';
      }
      break;

    case 'includesFlight':
      if (typeof value !== 'boolean') {
        return 'includesFlight must be a boolean';
      }
      break;

    default:
      break;
  }

  return null;
}

// Find package index by id
function getPackageIndex(id) {
  return packages.findIndex((pkg) => String(pkg.id) === String(id));
}

// ---------------- Routes ---------------- //

// GET /api/packages - List with search, filter, sort, pagination
app.get(['/api/packages', '/packages'], (req, res) => {
  let list = [...packages];

  // 1. Pagination parameters validation
  let page = 1;
  let limit = 10;

  if (req.query.page !== undefined) {
    const p = Number(req.query.page);
    if (!Number.isInteger(p) || p < 1) {
      return res.status(400).json({ error: 'Page must be a positive integer' });
    }
    page = p;
  }

  if (req.query.limit !== undefined) {
    const l = Number(req.query.limit);
    if (!Number.isInteger(l) || l < 1 || l > 50) {
      return res.status(400).json({ error: 'Limit must be an integer between 1 and 50' });
    }
    limit = l;
  }

  // 2. Search (matches text1 'name' or text2 'destination')
  const searchQuery = req.query.search ?? req.query.q;
  if (searchQuery !== undefined && typeof searchQuery === 'string') {
    const term = searchQuery.trim().toLowerCase();
    if (term.length > 0) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.destination.toLowerCase().includes(term)
      );
    }
  }

  // 3. Filters
  // Filter by category (enum, case-sensitive)
  const categoryFilter = req.query.category ?? req.query.enum;
  if (categoryFilter !== undefined) {
    if (!VALID_CATEGORIES.includes(categoryFilter)) {
      return res.status(400).json({ error: 'Invalid category filter' });
    }
    list = list.filter((p) => p.category === categoryFilter);
  }

  // Filter by includesFlight (flag)
  const flagFilter = req.query.includesFlight ?? req.query.flag;
  if (flagFilter !== undefined) {
    if (flagFilter !== 'true' && flagFilter !== 'false') {
      return res.status(400).json({ error: 'Flag filter must be true or false' });
    }
    const boolVal = flagFilter === 'true';
    list = list.filter((p) => p.includesFlight === boolVal);
  }

  // Filter by min / max price (amount)
  const minVal =
    req.query.minPricePerPerson ??
    req.query.minPrice ??
    req.query.minAmount ??
    req.query.min;

  const maxVal =
    req.query.maxPricePerPerson ??
    req.query.maxPrice ??
    req.query.maxAmount ??
    req.query.max;

  let minNum = null;
  let maxNum = null;

  if (minVal !== undefined) {
    minNum = Number(minVal);
    if (Number.isNaN(minNum) || minNum < 0) {
      return res.status(400).json({ error: 'min filter must be a valid non-negative number' });
    }
  }

  if (maxVal !== undefined) {
    maxNum = Number(maxVal);
    if (Number.isNaN(maxNum) || maxNum < 0) {
      return res.status(400).json({ error: 'max filter must be a valid non-negative number' });
    }
  }

  if (minNum !== null && maxNum !== null && minNum > maxNum) {
    return res.status(400).json({ error: 'min cannot be greater than max' });
  }

  if (minNum !== null) {
    list = list.filter((p) => p.pricePerPerson >= minNum);
  }
  if (maxNum !== null) {
    list = list.filter((p) => p.pricePerPerson <= maxNum);
  }

  // 4. Sorting
  const sortParam = req.query.sort ?? req.query.sortBy;
  const orderParam = req.query.order ?? 'asc';

  if (orderParam && !['asc', 'desc', 'ascending', 'descending'].includes(orderParam.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid order parameter' });
  }
  const isDesc = orderParam.toLowerCase() === 'desc' || orderParam.toLowerCase() === 'descending';

  if (sortParam !== undefined) {
    const validSortFields = [
      'pricePerPerson',
      'amount',
      'price',
      'name',
      'text1',
      'destination',
      'text2',
      'durationDays',
      'count',
      'category',
      'enum',
      'id',
    ];

    if (!validSortFields.includes(sortParam)) {
      return res.status(400).json({ error: `Invalid sort field: ${sortParam}` });
    }

    list.sort((a, b) => {
      let valA;
      let valB;

      if (['pricePerPerson', 'amount', 'price'].includes(sortParam)) {
        valA = a.pricePerPerson;
        valB = b.pricePerPerson;
      } else if (['name', 'text1'].includes(sortParam)) {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (['destination', 'text2'].includes(sortParam)) {
        valA = a.destination.toLowerCase();
        valB = b.destination.toLowerCase();
      } else if (['durationDays', 'count'].includes(sortParam)) {
        valA = a.durationDays;
        valB = b.durationDays;
      } else if (['category', 'enum'].includes(sortParam)) {
        valA = a.category;
        valB = b.category;
      } else {
        valA = a.id;
        valB = b.id;
      }

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  } else {
    // Default order: id ascending
    list.sort((a, b) => a.id - b.id);
  }

  // 5. Total and Pagination slicing
  const total = list.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const pagedData = list.slice(startIndex, startIndex + limit);

  return res.status(200).json({
    data: pagedData,
    page,
    limit,
    total,
    totalPages,
  });
});

// GET /api/packages/:id - Get single package
app.get(['/api/packages/:id', '/packages/:id'], (req, res) => {
  const index = getPackageIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Package not found' });
  }

  return res.status(200).json(packages[index]);
});

// POST /api/packages - Create package
app.post(['/api/packages', '/packages'], (req, res) => {
  const data = req.body;

  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Invalid or empty request body' });
  }

  // Validate all required fields
  for (const field of REQUIRED_FIELDS) {
    const error = validateField(field, data[field]);
    if (error) {
      return res.status(400).json({ error });
    }
  }

  const newPackage = {
    id: nextId++,
    name: data.name.trim(),
    destination: data.destination.trim(),
    category: data.category,
    pricePerPerson: data.pricePerPerson,
    durationDays: data.durationDays,
    includesFlight: data.includesFlight,
  };

  packages.push(newPackage);
  return res.status(201).json(newPackage);
});

// PUT /api/packages/:id - Replace full record
app.put(['/api/packages/:id', '/packages/:id'], (req, res) => {
  const index = getPackageIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Package not found' });
  }

  const data = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Invalid or empty request body' });
  }

  const currentId = packages[index].id;

  // PUT requires all fields validated by the same rules as POST
  for (const field of REQUIRED_FIELDS) {
    const error = validateField(field, data[field], currentId);
    if (error) {
      return res.status(400).json({ error });
    }
  }

  // Replace record (id is immutable)
  packages[index] = {
    id: currentId,
    name: data.name.trim(),
    destination: data.destination.trim(),
    category: data.category,
    pricePerPerson: data.pricePerPerson,
    durationDays: data.durationDays,
    includesFlight: data.includesFlight,
  };

  return res.status(200).json(packages[index]);
});

// PATCH /api/packages/:id - Partial update
app.patch(['/api/packages/:id', '/packages/:id'], (req, res) => {
  const index = getPackageIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Package not found' });
  }

  const data = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Invalid or empty request body' });
  }

  const currentId = packages[index].id;

  // Filter recognized fields (unknown fields are ignored)
  const fieldsToUpdate = REQUIRED_FIELDS.filter((key) => data[key] !== undefined);
  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({
      error: 'At least one valid field is required for update',
    });
  }

  // Validate every provided field
  for (const field of fieldsToUpdate) {
    const error = validateField(field, data[field], currentId);
    if (error) {
      return res.status(400).json({ error });
    }
  }

  // Apply updates (id is never changed)
  for (const field of fieldsToUpdate) {
    const val = data[field];
    packages[index][field] =
      typeof val === 'string' && field !== 'category' ? val.trim() : val;
  }

  return res.status(200).json(packages[index]);
});

// DELETE /api/packages/:id - Delete record (204 No Content)
app.delete(['/api/packages/:id', '/packages/:id'], (req, res) => {
  const index = getPackageIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Package not found' });
  }

  packages.splice(index, 1);
  return res.status(204).end();
});

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Handle bad JSON syntax
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  next(err);
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server started and listening on port ${PORT}`);
});

module.exports = app;
