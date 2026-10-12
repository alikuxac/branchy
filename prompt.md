Task: Implement Ledger Graph Traversal & Balance Resolver

Mô tả: Viết hàm duyệt ngược đồ thị từ headNodeId về node gốc (root) để tính số dư lũy kế tại một thời điểm $T$ bất kỳ. Xử lý trường hợp phân nhánh không bị ảnh hưởng bởi các commit trên nhánh khác.

Kết quả đầu ra: Hàm resolveBalanceAt(nodeId: string, graph: NodeMap): number kèm unit test kiểm tra traversal.