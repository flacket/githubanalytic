<script>
import { Bar, mixins } from "vue-chartjs"
const { reactiveProp } = mixins

export default {
  extends: Bar,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      options: {
        responsive: true, 
        maintainAspectRatio: true
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>


