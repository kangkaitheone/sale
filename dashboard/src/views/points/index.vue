<template>
  <div>
    <Row>
      <Col span="5">
        <OrgTree :state="true" @complete="init" ></OrgTree>
      </Col>
      <Col span="19">
      <Card dis-hover>
        <div class="page-body">
          <Form slot="filter" ref="queryForm" :label-width="60" label-position="left" inline>
            <Row :gutter="4">
              <Col span="16">
              <FormItem label="点位名:">
                <Input v-model="filters.pointName" />
              </FormItem>
              </Col>
              <Col span="6">
              <Button  icon="ios-search" type="primary" size="large" @click="init" class="toolbar-btn">查找</Button>
              <Button  class="toolbar-btn" v-if="current" @click="Create" icon="android-add" type="primary" size="large">添加</Button>
              <Button  @click="batchDelete" type="primary" class="toolbar-btn" size="large">批量删除</Button>
              </Col>
            </Row>
          </Form>
          <SaleTable ref="table" :filters="filters" :type="'point'" :columns="columns"></SaleTable>
        </div>
      </Card>
      </Col>
    </Row>

    <modify v-model="ModalShow" @save-success="init"></modify>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Prop, Watch } from "vue-property-decorator";
import SaleTable from "@/components/saletable.vue";
import AbpBase from "@/lib/abpbase";
import PageRequest from "../../store/entities/page-request";
import Util from "../../lib/util";
import Point from "@/store/entities/point";
import OrgTree from "@/components/orgtree.vue";
import Modify from "./modify.vue";

@Component({
  components: {
    SaleTable,
    Modify,
    OrgTree
  }
})
export default class PointC extends AbpBase {
  filters: any = {
    name: "",
    code: ""
  };
  p: any = {
    modify: this.hasPermission("point:modify"),
    delete: this.hasPermission("point:delete"),
    list: this.hasPermission("point:list"),
    first: this.hasPermission("point:first"),
    batch: this.hasPermission("point:batch")
  };
  ModalShow: boolean = false;
  get current() {
    return this.$store.state.device.currentOrg;
  }
  columns: Array<any> = [
    {
      type: "selection",
      width: 60,
      align: "center"
    },
    {
      title: "点位名称",
      key: "pointName"
    },
    {
      title: "地址",
      key: "address"
    },
    {
      title: "描述",
      key: "description"
    },
    {
      title: "创建时间",
      render: (h: any, params: any) => {
        return h(
          "span",
          new Date(params.row.creationTime).toLocaleDateString()
        );
      }
    },
    {
      title: "操作",
      key: "Actions",
      width: 150,
      render: (h: any, params: any) => {
        var ed = h(
          "Button",
          {
            props: {
              type: "primary",
              size: "small",
              disabled: !this.p.modify
            },
            style: {
              marginRight: "5px"
            },
            on: {
              click: () => {
                this.$store.dispatch({
                  type: "point/get",
                  data: params.row.id
                });
                this.Modify();
              }
            }
          },
          "编辑"
        );

        var de = h(
          "Button",
          {
            props: {
              type: "error",
              size: "small",
              disabled: !this.p.delete
            },
            on: {
              click: async () => {
                this.$Modal.confirm({
                  title: "删除提示",
                  content: "确认要删除么",
                  okText: "是",
                  cancelText: "否",
                  onOk: async () => {
                    await this.$store.dispatch({
                      type: "point/delete",
                      data: params.row
                    });
                    await this.init();
                  }
                });
              }
            }
          },
          "删除"
        );
        var t = [ed, de];
        return h("div", t);
      }
    }
  ];

  Create() {
    var u = new Point();
    this.$store.commit("point/edit", u);
    this.ModalShow = true;
  }
  init() {
    var t: any = this.$refs.table;
    if (this.current) {
      this.filters.code = this.current.code;
    }
    t.getpage();
  }
  async batchDelete() {
    var t: any = this.$refs.table;
    if (t.selections) {
      this.$Modal.confirm({
        title: "删除提示",
        content: `确认要删除${t.selections.length}条数据么`,
        okText: "是",
        cancelText: "否",
        onOk: async () => {
          await this.$store.dispatch({
            type: "point/batch",
            data: t.selections
          });
          await this.init();
        }
      });
    }
  }
  Modify() {
    this.ModalShow = true;
  }
  async created() {}
}
</script>