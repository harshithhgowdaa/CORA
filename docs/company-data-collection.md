# Company data collection

Apply `supabase/migrations/20260817000000_company_data_collection.sql` before using the new Company Pipeline import workflow.

In **Company Pipeline**, choose **Import file** and upload the first worksheet of an `.xlsx`, `.xls`, or `.csv` file. CORA previews the first five rows and lets an officer map every source column. Map one column to **Company name**. Columns marked **Keep as custom field** are retained in `companies.imported_data`, displayed on the Company 360° page, and included in the Company Pipeline's text search.

Imports are capped at 500 rows and run through a database function. A company is updated if its external key matches; otherwise its case-insensitive name is used. Blank values never erase existing values. Every import has an `import_jobs` audit record.

Placement officers can add any number of extra contact details when creating a contact. Each detail has a communication type and value; these are retained as structured JSON and displayed on the Company 360° view.

## Research and verification

The **Company research** card reads the public HTTPS company website after a user explicitly starts research. It attempts to identify CEO, founders, and founding year, stores the website URL as evidence, and marks results **needs review**. An officer must open the listed source and choose **Verify** before the record becomes **verified**. This keeps research assistive rather than treating an automated guess as a fact.

The website reader intentionally rejects localhost and private IPv4 destinations, accepts only HTTPS, has an eight-second timeout, and is rate-limited to ten requests per officer per minute. It is not connected to a paid AI or search provider. For broader coverage, add approved source links and values through the enrichment action or an approved server-side research provider; never expose provider keys to the browser.
