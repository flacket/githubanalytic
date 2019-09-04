<template>
  <v-dialog max-width="600px" v-model="dialog">
    <template v-slot:activator="{ on }">
      <v-btn text v-on="on">Set Token</v-btn>
    </template>
    
    <v-card>
      <v-card-title>
        <h4>Github Token</h4>
      </v-card-title>
      <v-card-text>
        <v-form class="px-3" ref="form">
          <v-text-field v-model="token" label="Ingrese su token de github aquí" prepend-icon="lock" 
          :rules="[rules.required]"
          ></v-text-field>
          <!--<v-text-field
            v-model="password" name="input-10-1" label="Contraseña" prepend-icon="vpn_key"
            :rules="[rules.required, rules.min]"
            :type="show ? 'text' : 'password'"
            :append-icon="show ? 'visibility' : 'visibility_off'"
            @click:append="show = !show"
          ></v-text-field>-->
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click="submit" color="success">Aceptar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
data() {
    return {
        token: '',
        show: false,
        dialog: false,
        rules: {
            required: value => !!value || 'Campo Obligatorio',
            min: v => v.length >= 8 || 'Mínimo 8 Caracteres',
            passMatch: () => ('El usuario y contraseña ingresados no coinciden')
        }
    }
},
methods: {
    submit() {
        if(this.$refs.form.validate()){   
            localStorage.setItem("token", this.token)
            console.log('Token Guardado: ',localStorage.getItem("token"))
            this.$router.go({ path: this.$router.path });
        }
    }
}
}
</script>