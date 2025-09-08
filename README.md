# Two Dimensional Reserving

Open source application to serve as an alternative for state and federal specific reserving with pipeline from SAS, SQL, and SQL alternatives.

## Description

This project is meant to be an alternative to Moody's Axis. The features in Axis are often times not optimized for use or otherwise are difficult to manage. 

## Current Timeline

Research: September 2025 - February 2026
Backend Development: March 2026 - June 2026
Frontend Development: July 2026 - January 2027
Reevaluation: February 2027 

### Research

Current item is to setup a "program only" claims triangle which takes as input four items:

1. Incurred Date (date): date on which a claim was incurred
2. Paid Date (date): date on which a claim was paid 
3. Delimiter (string: can have multiple for non-credible products i.e. "MA1,MA2" would create a claims triangle for both MA1 and MA2 claims combined): a string delimiter to separate claims into reserving "buckets". In effect, each delimiter would have its own claims triangle
4. Paid Amount (money: a decimal rounded to closest cent on input): the amount paid out