/**
 * @name Hotel Room Booking System
 * @author Prabhjot Saini
 * @description Hotel Room Booking and Management System Software ~ Developed By Prabhjot Saini
 * 2026 Prabhjot's capstone project
 * @version v0.0.1
 *
 */

/**
 * MyQueryHelper — Builds Prisma-compatible query option objects.
 *
 * The public API (.search(), .sort(), .paginate()) can be chained
 * to build query options for Prisma's findMany().
 *
 * Usage:
 *   const helper = new MyQueryHelper(req.query).search('fullName').sort().paginate();
 *   const options = helper.getQueryOptions();
 *   // options = { where: {...}, orderBy: {...}, skip: N, take: N }
 *   const results = await prisma.users.findMany({ ...options, include: {...} });
 */
class MyQueryHelper {
  constructor(queryStr) {
    this.queryStr = queryStr;
    this.where = {};
    this.orderBy = { createdAt: 'asc' };
    this.skip = 0;
    this.take = 1000;
  }

  /**
   * search based on keyword
   * @param {string} key search field key
   * @returns {MyQueryHelper} this (for chaining)
   */
  search(key) {
    if (this.queryStr.keyword) {
      this.where[key] = {
        contains: this.queryStr.keyword,
        mode: 'insensitive'
      };
    }
    return this;
  }

  /**
   * sort based on query param
   * @returns {MyQueryHelper} this (for chaining)
   */
  sort() {
    const sortOrder = this.queryStr.sort === 'desc' ? 'desc' : 'asc';
    this.orderBy = { createdAt: sortOrder };
    return this;
  }

  /**
   * paginate based on page and limit number
   * @returns {MyQueryHelper} this (for chaining)
   */
  paginate() {
    const page = this.queryStr.page ? parseInt(this.queryStr.page, 10) : 1;
    const limit = this.queryStr.limit ? parseInt(this.queryStr.limit, 10) : 1000;
    this.skip = (page - 1) * limit;
    this.take = limit;
    return this;
  }

  /**
   * Returns the built Prisma query options object.
   * Can be spread into prisma.model.findMany().
   *
   * @param {object} [extraWhere={}] - Additional where conditions to merge
   * @returns {{ where: object, orderBy: object, skip: number, take: number }}
   */
  getQueryOptions(extraWhere = {}) {
    return {
      where: { ...this.where, ...extraWhere },
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take
    };
  }
}

module.exports = MyQueryHelper;
