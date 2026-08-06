# ADR 0001: ClickHouse Analytics Architecture

## Status
Accepted

## Context
Standard relational databases like PostgreSQL experience severe performance degradation when querying billions of raw click events for multi-dimensional aggregations (e.g. real-time device breakdowns, Geo maps, hourly trends).

## Decision
We adopt **ClickHouse MergeTree** as our dedicated analytical column-oriented database while retaining **PostgreSQL** for relational metadata (Links, Users, API Keys).

## Consequences
- **Positive:** Sub-10ms query times over billions of records. High compression ratio for telemetry logs.
- **Negative:** Requires running a ClickHouse instance alongside Postgres in production container setups.
