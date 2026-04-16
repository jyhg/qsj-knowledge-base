import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('business_rules')
export class BusinessRuleEntity {
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
  createdBy?: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
