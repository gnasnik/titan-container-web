import React from 'react';
import {
  Grid, Typography, Button
} from '@arco-design/web-react';
import { IconArrowLeft } from '@arco-design/web-react/icon';
import styles from './error.module.less';
import IMG_500 from '@/assets/error/500.png';

const { Row } = Grid;
const { Col } = Grid;

export default function Error500() {
  return (
    <div className={'app-main-container ' + styles.error}>
      <div className={styles['error-wrap']}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
            <div className={styles['error-img']}>
              <img src={IMG_500} alt="" width="80%" />
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
            <div className={styles['error-content']}>
              <Typography.Title type="primary">Sorry!</Typography.Title>
              <Typography.Title heading={5}>You do not have permission to access this page...</Typography.Title>
              <Typography.Text>Please contact the administrator or click the button below to return to the homepage.</Typography.Text>
              <div className={styles['back-home']}>
                <Button shape="round" type="primary" icon={<IconArrowLeft />}>
                  Back
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
