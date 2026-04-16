import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('test_cases')
export class TestCaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tableId!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  riskLevel?: string;

  @Column({ type: 'json', nullable: true })
  sql?: string[];

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
