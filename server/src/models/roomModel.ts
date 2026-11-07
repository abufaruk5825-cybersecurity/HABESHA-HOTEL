import { query, queryOne, execute } from '../config/database.ts';

export const RoomModel = {
  async findAll() {
    return query(`
      SELECT r.*, rt.name as room_type_name, rt.code as room_type_code,
             rt.base_price, rt.bed_type, rt.capacity, rt.size_sqm, rt.image_url as room_type_image
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY r.floor_number ASC, r.room_number ASC
    `);
  },

  async findById(id: number) {
    return queryOne(`
      SELECT r.*, rt.name as room_type_name, rt.code as room_type_code,
             rt.base_price, rt.bed_type, rt.capacity, rt.size_sqm, rt.image_url as room_type_image
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ?
    `, [id]);
  },
};

